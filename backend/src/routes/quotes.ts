import crypto from "node:crypto";
import { Router } from "express";
import { z } from "zod";
import { recalculateQuote } from "../services/calcService.js";
import { generatePoCsv, buildQuoteHtml } from "../services/exportService.js";
import { store } from "../lib/inMemoryStore.js";

const rowSchema = z.object({
  id: z.string(),
  rowType: z.enum(["db_part", "manual_part", "note"]),
  partNumber: z.string().optional(),
  qty: z.number().optional(),
  description: z.string().optional(),
  masterCostSnapshot: z.number().optional(),
  overrideCost: z.number().optional(),
});

const quoteSchema = z.object({
  id: z.string(),
  quoteNumber: z.string(),
  versionNo: z.number(),
  customerName: z.string(),
  rjaMarkupPct: z.number(),
  repMarkupPct: z.number(),
  rows: z.array(rowSchema),
});

export const quotesRouter = Router();
quotesRouter.post("/", (req, res) => {
  const parsed = quoteSchema.parse(req.body);
  const recalculated = recalculateQuote(parsed);
  store.quotes.set(recalculated.id, recalculated);
  res.status(201).json(recalculated);
});

quotesRouter.get("/:id", (req, res) => {
  const quote = store.quotes.get(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  return res.json(quote);
});

quotesRouter.post("/:id/revise", (req, res) => {
  const original = store.quotes.get(req.params.id);
  if (!original) return res.status(404).json({ message: "Not found" });
  const revised = { ...original, id: crypto.randomUUID(), versionNo: original.versionNo + 1 };
  store.quotes.set(revised.id, revised);
  return res.status(201).json(revised);
});

quotesRouter.post("/:id/export/po-csv", (req, res) => {
  const quote = store.quotes.get(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  const csv = generatePoCsv(quote);
  res.type("text/csv").send(csv);
});

quotesRouter.post("/:id/export/pdf", (req, res) => {
  const quote = store.quotes.get(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  const html = buildQuoteHtml(quote);
  res.type("text/html").send(html);
});
