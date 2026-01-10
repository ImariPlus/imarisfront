import { PrismaClient, PaymentMethod, UserRole } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- ENV GUARD ---
  if (!process.env.ADMIN_PASSWORD) {
    throw new Error("❌ ADMIN_PASSWORD is not set in environment variables");
  }

  // --- CLEAN EXISTING DATA (DEV ONLY) ---
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();

  // --- ADMIN USER ---
  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    10
  );

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@imari.com" },
    update: {
      password: hashedPassword,
      role: UserRole.ADMIN,
    },
    create: {
      email: "admin@imari.com",
      name: "Admin",
      role: UserRole.ADMIN,
      password: hashedPassword,
    },
  });

  // --- PHYSICIANS ---
  const physicianNames = ["Dr. Ally", "Dr. Joyeuse", "Dr. Bwiza"];

  for (const name of physicianNames) {
    await prisma.physician.upsert({
      where: { name }, // 👈 must be a UNIQUE field
      update: {},
      create: { name },
    });
  }

  const allPhysicians = await prisma.physician.findMany();

  if (allPhysicians.length === 0) {
    throw new Error("❌ No physicians found. Seed failed.");
  }

  // --- TRANSACTIONS (last 14 days) ---
  for (let i = 0; i < 40; i++) {
    const physician =
      allPhysicians[Math.floor(Math.random() * allPhysicians.length)];

    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.transaction.create({
      data: {
        clientName: "Seed Client",
        amount: Math.floor(Math.random() * 200_000) + 20_000,
        paymentMethod:
          Math.random() > 0.7
            ? PaymentMethod.CASH
            : PaymentMethod.MOBILE,
        physicianId: physician.id,
        createdById: adminUser.id,
        createdAt,
      },
    });
  }

  // --- EXPENSES (last 30 days) ---
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.expense.create({
      data: {
        title: "Clinic expense",
        amount: Math.floor(Math.random() * 100_000) + 10_000,
        category: "SUPPLIES",
        recordedById: adminUser.id,
        createdAt,
      },
    });
  }

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
