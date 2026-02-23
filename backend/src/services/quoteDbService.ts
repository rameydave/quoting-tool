import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { QuoteInput, QuoteRowInput } from "../types/domain.js";

function decimalToNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

function mapRows(rows: any[]): QuoteRowInput[] {
  return rows
    .sort((a, b) => a.lineOrder - b.lineOrder)
    .map((row) => ({
      id: row.id,
      rowType: row.rowType,
      partNumber: row.partNumber ?? undefined,
      qty: decimalToNumber(row.qty),
      description: row.description ?? undefined,
      masterCostSnapshot: decimalToNumber(row.masterCostSnapshot),
      overrideCost: decimalToNumber(row.overrideCost),
      effectiveCost: decimalToNumber(row.effectiveCost),
      sellUnitPrice: decimalToNumber(row.sellUnitPrice),
      lineTotal: decimalToNumber(row.lineTotal),
    }));
}

export async function saveQuoteToDb(quote: QuoteInput): Promise<QuoteInput> {
  const versionGroupId = crypto.randomUUID();
  const created = await prisma.quote.create({
    data: {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      versionGroupId,
      versionNo: quote.versionNo,
      quoteDate: new Date(),
      customerName: quote.customerName,
      rjaMarkupPct: quote.rjaMarkupPct,
      repMarkupPct: quote.repMarkupPct,
      totalMarkupPct: quote.totalMarkupPct ?? quote.rjaMarkupPct + quote.repMarkupPct,
      subtotalSell: quote.subtotalSell ?? 0,
      grandTotal: quote.grandTotal ?? 0,
      createdByUserId: crypto.randomUUID(),
      rows: {
        create: quote.rows.map((row, index) => ({
          id: row.id,
          lineOrder: index + 1,
          rowType: row.rowType,
          partNumber: row.partNumber,
          qty: row.qty,
          description: row.description,
          masterCostSnapshot: row.masterCostSnapshot,
          overrideCost: row.overrideCost,
          effectiveCost: row.effectiveCost,
          sellUnitPrice: row.sellUnitPrice,
          lineTotal: row.lineTotal,
        })),
      },
    },
    include: { rows: true },
  });

  return {
    id: created.id,
    quoteNumber: created.quoteNumber,
    versionNo: created.versionNo,
    customerName: created.customerName,
    rjaMarkupPct: Number(created.rjaMarkupPct),
    repMarkupPct: Number(created.repMarkupPct),
    totalMarkupPct: Number(created.totalMarkupPct),
    subtotalSell: Number(created.subtotalSell),
    grandTotal: Number(created.grandTotal),
    rows: mapRows(created.rows),
  };
}

export async function getQuoteFromDb(id: string): Promise<QuoteInput | null> {
  const quote = await prisma.quote.findUnique({ where: { id }, include: { rows: true } });
  if (!quote) return null;
  return {
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    versionNo: quote.versionNo,
    customerName: quote.customerName,
    rjaMarkupPct: Number(quote.rjaMarkupPct),
    repMarkupPct: Number(quote.repMarkupPct),
    totalMarkupPct: Number(quote.totalMarkupPct),
    subtotalSell: Number(quote.subtotalSell),
    grandTotal: Number(quote.grandTotal),
    rows: mapRows(quote.rows),
  };
}

export async function reviseQuoteInDb(id: string): Promise<QuoteInput | null> {
  const original = await prisma.quote.findUnique({ where: { id }, include: { rows: true } });
  if (!original) return null;

  const revised = await prisma.quote.create({
    data: {
      id: crypto.randomUUID(),
      quoteNumber: original.quoteNumber,
      versionGroupId: original.versionGroupId,
      versionNo: original.versionNo + 1,
      status: original.status,
      quoteDate: original.quoteDate,
      customerName: original.customerName,
      customerAttn: original.customerAttn,
      customerAddress1: original.customerAddress1,
      customerAddress2: original.customerAddress2,
      customerCity: original.customerCity,
      customerState: original.customerState,
      customerZip: original.customerZip,
      projectName: original.projectName,
      estimatorName: original.estimatorName,
      estimatorEmail: original.estimatorEmail,
      estimatorPhone: original.estimatorPhone,
      repCode: original.repCode,
      rjaMarkupPct: original.rjaMarkupPct,
      repMarkupPct: original.repMarkupPct,
      totalMarkupPct: original.totalMarkupPct,
      subtotalSell: original.subtotalSell,
      grandTotal: original.grandTotal,
      notesFooter: original.notesFooter,
      createdByUserId: original.createdByUserId,
      revisedFromQuoteId: original.id,
      rows: {
        create: original.rows.map((row) => ({
          id: crypto.randomUUID(),
          lineOrder: row.lineOrder,
          rowType: row.rowType,
          sourcePartId: row.sourcePartId,
          partNumber: row.partNumber,
          qty: row.qty,
          description: row.description,
          masterCostSnapshot: row.masterCostSnapshot,
          overrideCost: row.overrideCost,
          effectiveCost: row.effectiveCost,
          sellUnitPrice: row.sellUnitPrice,
          lineTotal: row.lineTotal,
          isPriceOverridden: row.isPriceOverridden,
          overrideReason: row.overrideReason,
          createdByUserId: row.createdByUserId,
        })),
      },
    },
    include: { rows: true },
  });

  return {
    id: revised.id,
    quoteNumber: revised.quoteNumber,
    versionNo: revised.versionNo,
    customerName: revised.customerName,
    rjaMarkupPct: Number(revised.rjaMarkupPct),
    repMarkupPct: Number(revised.repMarkupPct),
    totalMarkupPct: Number(revised.totalMarkupPct),
    subtotalSell: Number(revised.subtotalSell),
    grandTotal: Number(revised.grandTotal),
    rows: mapRows(revised.rows),
  };
}
