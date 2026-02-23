import { Router } from "express";
import { z } from "zod";
import { recalculateQuote } from "../services/calcService.js";
import { generatePoCsv, buildQuoteHtml } from "../services/exportService.js";
import { getQuoteFromDb, reviseQuoteInDb, saveQuoteToDb } from "../services/quoteDbService.js";

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
quotesRouter.post("/", async (req, res) => {
  const parsed = quoteSchema.parse(req.body);
  const recalculated = recalculateQuote(parsed);
  const saved = await saveQuoteToDb(recalculated);
  res.status(201).json(saved);
});

quotesRouter.get("/:id", async (req, res) => {
  const quote = await getQuoteFromDb(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  return res.json(quote);
});

quotesRouter.post("/:id/revise", async (req, res) => {
  const revised = await reviseQuoteInDb(req.params.id);
  if (!revised) return res.status(404).json({ message: "Not found" });
  return res.status(201).json(revised);
});

quotesRouter.post("/:id/export/po-csv", async (req, res) => {
  const quote = await getQuoteFromDb(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  const csv = generatePoCsv(quote);
  res.type("text/csv").send(csv);
});

quotesRouter.post("/:id/export/pdf", async (req, res) => {
  const quote = await getQuoteFromDb(req.params.id);
  if (!quote) return res.status(404).json({ message: "Not found" });
  const html = buildQuoteHtml(quote);
  res.type("text/html").send(html);
});
