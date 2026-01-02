import { PrismaClient, PaymentMethod, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  /**
   * CLEAN EXISTING DATA (safe for dev)
   * Remove this block if you want cumulative seeds
   */
  await prisma.transaction.deleteMany();
  await prisma.expense.deleteMany();

  // USERS
  const user = await prisma.user.upsert({
    where: { email: "admin@imari.com" },
    update: {},
    create: {
      email: "admin@imari.com",
      name: "Admin",
      role: UserRole.ADMIN,
    },
  });

  // PHYSICIANS
  const physicianNames = ["Dr. Ally", "Dr. Joyeuse", "Dr. Bwiza"];

  for (const name of physicianNames) {
    await prisma.physician.upsert({
      where: { id: name },
      update: {},
      create: { name },
    });
  }

  const allPhysicians = await prisma.physician.findMany();

  if (allPhysicians.length === 0) {
    throw new Error("❌ No physicians found. Seed failed.");
  }

  // TRANSACTIONS (last 14 days)
  for (let i = 0; i < 40; i++) {
    const physician =
      allPhysicians[Math.floor(Math.random() * allPhysicians.length)];

    const daysAgo = Math.floor(Math.random() * 14);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.transaction.create({
      data: {
        amount: Math.floor(Math.random() * 200_000) + 20_000,
        paymentMethod:
          Math.random() > 0.7
            ? PaymentMethod.CASH
            : PaymentMethod.MOBILE,
        physicianId: physician.id,
        clientName: "Seed Client",
        createdById: user.id,
        createdAt,
      },
    });
  }

  // EXPENSES (last 30 days)
  for (let i = 0; i < 10; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - daysAgo);

    await prisma.expense.create({
      data: {
        title: "Clinic expense",
        amount: Math.floor(Math.random() * 100_000) + 10_000,
        category: "SUPPLIES",
        recordedById: user.id,
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
