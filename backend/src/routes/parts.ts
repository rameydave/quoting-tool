import { Router } from "express";
import { prisma } from "../lib/prisma.js";

export const partsRouter = Router();

partsRouter.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").toLowerCase().trim();
  const limit = Number(req.query.limit ?? 20);

  const starts = await prisma.part.findMany({
    where: { partNumber: { startsWith: q, mode: "insensitive" } },
    take: limit,
    orderBy: { partNumber: "asc" },
  });

  const startIds = starts.map((p) => p.id);
  const remaining = Math.max(limit - starts.length, 0);

  const contains = remaining
    ? await prisma.part.findMany({
        where: {
          partNumber: { contains: q, mode: "insensitive" },
          NOT: { id: { in: startIds } },
        },
        take: remaining,
        orderBy: { partNumber: "asc" },
      })
    : [];

  const containsIds = contains.map((p) => p.id);
  const remainingDesc = Math.max(limit - starts.length - contains.length, 0);

  const desc = remainingDesc
    ? await prisma.part.findMany({
        where: {
          description: { contains: q, mode: "insensitive" },
          NOT: { id: { in: [...startIds, ...containsIds] } },
        },
        take: remainingDesc,
        orderBy: { partNumber: "asc" },
      })
    : [];

  const ranked = [...starts, ...contains, ...desc].map((p) => ({ id: p.id, partNumber: p.partNumber, description: p.description }));
  res.json(ranked);
});
