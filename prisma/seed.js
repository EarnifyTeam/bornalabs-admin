const { PrismaClient, Role, UserStatus } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@bornalabs.com";
  const defaultPassword = "AdminPassword123!";

  console.log("Seeding default SUPER_ADMIN account...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin account (${adminEmail}) already exists.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      premiumStatus: true,
      notes: "Default System Super Administrator",
      profile: {
        create: {
          fullName: "BornaLabs Super Admin",
          country: "India",
          timezone: "Asia/Kolkata",
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log("✅ Default SUPER_ADMIN created successfully:");
  console.log(`- Email: ${adminUser.email}`);
  console.log(`- Password: ${defaultPassword}`);
  console.log(`- Role: ${adminUser.role}`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
