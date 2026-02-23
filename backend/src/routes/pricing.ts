import { Router } from "express";
import { z } from "zod";
import { canUpdateMasterPrice } from "../services/permissionService.js";
import { updateMasterPriceWithAudit } from "../services/pricingDbService.js";

const schema = z.object({ userRole: z.enum(["estimator", "pricing_admin", "admin"]), userId: z.string(), userName: z.string(), partId: z.string(), newCost: z.number(), reason: z.string().optional() });

export const pricingRouter = Router();
pricingRouter.post("/update-master-price", async (req, res) => {
  const input = schema.parse(req.body);
  if (!canUpdateMasterPrice(input.userRole)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const part = await updateMasterPriceWithAudit(input);
  if (!part) return res.status(404).json({ message: "Part not found" });

  return res.json({
    id: part.id,
    partNumber: part.partNumber,
    description: part.description,
    cost: Number(part.cost),
  });
});
