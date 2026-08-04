const { PrismaClient, Role, UserStatus } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "kumarsuraj0469@gmail.com";
  const defaultPassword = "Admin12345";

  console.log(`Seeding SUPER_ADMIN account (${adminEmail})...`);

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPassword, salt);

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      premiumStatus: true,
    },
    create: {
      email: adminEmail,
      passwordHash,
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      premiumStatus: true,
      notes: "System Super Administrator Account",
      profile: {
        create: {
          fullName: "Suraj Kumar (Super Admin)",
          country: "India",
          timezone: "Asia/Kolkata",
        },
      },
    },
    include: {
      profile: true,
    },
  });

  console.log("✅ SUPER_ADMIN configured successfully:");
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
