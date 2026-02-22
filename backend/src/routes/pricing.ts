import { Router } from "express";
import { z } from "zod";
import { canUpdateMasterPrice } from "../services/permissionService.js";
import { store } from "../lib/inMemoryStore.js";

const schema = z.object({ userRole: z.enum(["estimator", "pricing_admin", "admin"]), userId: z.string(), userName: z.string(), partId: z.string(), newCost: z.number(), reason: z.string().optional() });

export const pricingRouter = Router();
pricingRouter.post("/update-master-price", (req, res) => {
  const input = schema.parse(req.body);
  if (!canUpdateMasterPrice(input.userRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }
  const part = store.parts.get(input.partId);
  if (!part) return res.status(404).json({ message: "Part not found" });
  const oldCost = part.cost;
  part.cost = input.newCost;
  store.audit.push({
    eventType: "MASTER_PRICE_UPDATED",
    partId: part.id,
    partNumber: part.partNumber,
    oldValuesJson: { cost: oldCost },
    newValuesJson: { cost: input.newCost },
    userId: input.userId,
    userNameSnapshot: input.userName,
    reason: input.reason,
    createdAt: new Date().toISOString(),
  });
  return res.json(part);
});
