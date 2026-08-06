import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3003",
  "http://localhost:3004",
  "http://localhost:3005",
  "http://localhost:3006",
  "http://localhost:3007",
  "http://localhost:3008",
  "http://localhost:3009",
  "http://localhost:3010",
  "https://admin.bornalabs.in",
  "https://dashboard.bornalabs.in",
  "https://bornalabs.in",
];

const corsHeaders = (requestOrigin?: string | null) => {
  const isLocalOrigin = requestOrigin && /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+)$/.test(requestOrigin);
  const origin = isLocalOrigin
    ? requestOrigin
    : requestOrigin && allowedOrigins.includes(requestOrigin)
    ? requestOrigin
    : "*";

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PATCH",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
    "Vary": "Origin",
  };
};

export async function OPTIONS(request: Request) {
  const origin = request.headers.get("origin");
  return NextResponse.json({}, { headers: corsHeaders(origin) });
}

/**
 * GET: Fetch support tickets
 * - If userEmail or userId is provided: returns customer specific tickets
 * - If no query parameters or all=true: returns ALL tickets across all users (For Admin Panel)
 */
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const rawEmail = searchParams.get("userEmail") || searchParams.get("email") || "";
    const cleanEmail = rawEmail.trim().toLowerCase();
    const isAll = searchParams.get("all") === "true";

    // 1. If fetching for specific user
    if (!isAll && (userId || cleanEmail)) {
      let user = userId ? await prisma.user.findUnique({ where: { id: userId } }) : null;
      if (!user && cleanEmail) {
        user = await prisma.user.findFirst({
          where: { email: { equals: cleanEmail, mode: "insensitive" } },
        });
      }

      const targetUserId = user?.id;

      const tickets = await prisma.supportTicket.findMany({
        where: {
          OR: [
            ...(targetUserId ? [{ userId: targetUserId }] : []),
            ...(cleanEmail ? [{ user: { email: { equals: cleanEmail, mode: "insensitive" as const } } }] : []),
          ],
        },
        include: {
          user: {
            select: { id: true, email: true, role: true, profile: { select: { fullName: true } } },
          },
          supportMessages: {
            include: {
              sender: {
                select: { id: true, email: true, role: true, profile: { select: { fullName: true } } },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, tickets }, { headers: corsHeaders(origin) });
    }

    // 2. Fetch ALL tickets across all users for Admin Panel
    const allTickets = await prisma.supportTicket.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true, profile: { select: { fullName: true } } },
        },
        supportMessages: {
          include: {
            sender: {
              select: { id: true, email: true, role: true, profile: { select: { fullName: true } } },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, tickets: allTickets }, { headers: corsHeaders(origin) });
  } catch (error: any) {
    console.error("GET /api/user/support Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

/**
 * POST: Create a new Support Ticket (from User Panel or Admin)
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  try {
    const body = await request.json();
    const { userId, userEmail, email, subject, message, priority, category } = body;

    const rawEmail = (userEmail || email || "").trim().toLowerCase();

    // Find or provision user
    let targetUserId = userId;
    if (!targetUserId && rawEmail) {
      let existingUser = await prisma.user.findFirst({
        where: { email: { equals: rawEmail, mode: "insensitive" } },
      });

      if (!existingUser) {
        existingUser = await prisma.user.create({
          data: {
            email: rawEmail,
            passwordHash: "NOPASSWORD_TICKET_ISSUED",
            role: "CUSTOMER",
            status: "ACTIVE",
            profile: {
              create: {
                fullName: rawEmail.split("@")[0],
                country: "Global",
                timezone: "UTC",
              },
            },
          },
        });
      }
      targetUserId = existingUser.id;
    }

    if (!targetUserId) {
      // Fallback: assign to first user or super admin
      const fallbackUser = await prisma.user.findFirst();
      targetUserId = fallbackUser?.id;
    }

    if (!targetUserId || !subject || !message) {
      return NextResponse.json(
        { error: "REQUIRED_FIELDS_MISSING", message: "Subject and Message are required." },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    const ticketSubject = category ? `[${category}] ${subject.trim()}` : subject.trim();

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: targetUserId,
        subject: ticketSubject,
        status: "OPEN",
        priority: (priority || "MEDIUM").toUpperCase(),
        supportMessages: {
          create: {
            senderId: targetUserId,
            message: message.trim(),
          },
        },
      },
      include: {
        user: {
          select: { id: true, email: true, role: true, profile: { select: { fullName: true } } },
        },
        supportMessages: true,
      },
    });

    // Create system notification alert for admin
    try {
      await prisma.notification.create({
        data: {
          type: "SECURITY",
          title: "New Support Ticket Created",
          message: `Ticket "${ticketSubject}" submitted by ${rawEmail || targetUserId}`,
          targetRole: "SUPER_ADMIN",
          active: true,
        },
      });
    } catch {
      // ignore notification errors
    }

    return NextResponse.json({ success: true, ticket }, { status: 201, headers: corsHeaders(origin) });
  } catch (error: any) {
    console.error("POST /api/user/support Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}
