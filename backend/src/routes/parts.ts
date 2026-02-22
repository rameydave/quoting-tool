import { Router } from "express";
import { store } from "../lib/inMemoryStore.js";

export const partsRouter = Router();

partsRouter.get("/search", (req, res) => {
  const q = String(req.query.q ?? "").toLowerCase().trim();
  const limit = Number(req.query.limit ?? 20);
  const all = [...store.parts.values()];
  const starts = all.filter((p) => p.partNumber.toLowerCase().startsWith(q));
  const contains = all.filter((p) => !p.partNumber.toLowerCase().startsWith(q) && p.partNumber.toLowerCase().includes(q));
  const desc = all.filter((p) => !p.partNumber.toLowerCase().includes(q) && p.description.toLowerCase().includes(q));
  const ranked = [...starts, ...contains, ...desc].slice(0, limit).map((p) => ({ id: p.id, partNumber: p.partNumber, description: p.description }));
  res.json(ranked);
});
