import { prisma } from "../lib/prisma.js";

export interface UpdateMasterPriceInput {
  userId: string;
  userName: string;
  partId: string;
  newCost: number;
  reason?: string;
}

export async function updateMasterPriceWithAudit(input: UpdateMasterPriceInput) {
  return prisma.$transaction(async (tx) => {
    const part = await tx.part.findUnique({ where: { id: input.partId } });
    if (!part) return null;

    const updatedPart = await tx.part.update({
      where: { id: input.partId },
      data: { cost: input.newCost },
    });

    await tx.auditLog.create({
      data: {
        eventType: "MASTER_PRICE_UPDATED",
        entityType: "part",
        entityId: updatedPart.id,
        partId: updatedPart.id,
        partNumber: updatedPart.partNumber,
        userId: input.userId,
        userNameSnapshot: input.userName,
        oldValuesJson: { cost: Number(part.cost) },
        newValuesJson: { cost: input.newCost },
        reason: input.reason,
      },
    });

    return updatedPart;
  });
}
