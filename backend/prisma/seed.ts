import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("ChangeMe123!", 10);
  await prisma.user.upsert({
    where: { email: "estimator@example.com" },
    update: {},
    create: { email: "estimator@example.com", fullName: "Estimator User", role: "estimator", passwordHash },
  });
  await prisma.repMarkupSetting.upsert({ where: { repCode: "HOUSE" }, update: {}, create: { repCode: "HOUSE", repLabel: "House", defaultRepMarkupPct: 0.02 } });
  await prisma.repMarkupSetting.upsert({ where: { repCode: "PGP" }, update: {}, create: { repCode: "PGP", repLabel: "PGP", defaultRepMarkupPct: 0.03 } });
  await prisma.repMarkupSetting.upsert({ where: { repCode: "RB" }, update: {}, create: { repCode: "RB", repLabel: "RB", defaultRepMarkupPct: 0.04 } });
  await prisma.repMarkupSetting.upsert({ where: { repCode: "WBE" }, update: {}, create: { repCode: "WBE", repLabel: "WBE", defaultRepMarkupPct: 0.05 } });
}

main().finally(async () => prisma.$disconnect());
