import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "EMAIL_AND_PASSWORD_REQUIRED" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Safety restriction: only provision master admin account
    if (cleanEmail !== "kumarsuraj0469@gmail.com") {
      return NextResponse.json(
        { error: "UNAUTHORIZED_PROVISION" },
        { status: 403 }
      );
    }

    const supabaseAdmin = createAdminClient();

    // Check if user already exists in Supabase Cloud Auth
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Supabase listUsers Error:", listError);
    }

    const existingUser = usersData?.users?.find(
      (u) => u.email?.toLowerCase() === cleanEmail
    );

    if (existingUser) {
      // Update existing user password and auto-confirm email
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        existingUser.id,
        {
          password,
          email_confirm: true,
          user_metadata: {
            full_name: "Suraj Kumar",
            role: "SUPER_ADMIN",
          },
        }
      );

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "UPDATED",
        userId: existingUser.id,
      });
    } else {
      // Create new user in Supabase Cloud Auth
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: cleanEmail,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: "Suraj Kumar",
          role: "SUPER_ADMIN",
        },
      });

      if (createError) {
        return NextResponse.json(
          { error: createError.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        action: "CREATED",
        userId: newUser.user.id,
      });
    }
  } catch (error: any) {
    console.error("Provisioning Error:", error);
    return NextResponse.json(
      { error: "INTERNAL_SERVER_ERROR", message: error.message },
      { status: 500 }
    );
  }
}
