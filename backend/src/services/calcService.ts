import { QuoteInput, QuoteRowInput } from "../types/domain.js";

const round = (value: number, places: number) => {
  const f = 10 ** places;
  return Math.round(value * f) / f;
};

export function recalculateRow(row: QuoteRowInput, totalMarkupPct: number): QuoteRowInput {
  if (row.rowType === "note") {
    return { ...row, qty: undefined, masterCostSnapshot: undefined, overrideCost: undefined, effectiveCost: undefined, sellUnitPrice: undefined, lineTotal: undefined };
  }

  const effectiveCost = round(
    row.overrideCost ?? row.effectiveCost ?? row.masterCostSnapshot ?? 0,
    4,
  );
  const sellUnitPrice = round(effectiveCost * (1 + totalMarkupPct), 4);
  const lineTotal = round((row.qty ?? 0) * sellUnitPrice, 2);

  return { ...row, effectiveCost, sellUnitPrice, lineTotal };
}

export function recalculateQuote(quote: QuoteInput): QuoteInput {
  const totalMarkupPct = round(quote.rjaMarkupPct + quote.repMarkupPct, 4);
  const rows = quote.rows.map((r) => recalculateRow(r, totalMarkupPct));
  const subtotalSell = round(
    rows
      .filter((r) => r.rowType !== "note")
      .reduce((sum, r) => sum + (r.lineTotal ?? 0), 0),
    2,
  );

  return { ...quote, totalMarkupPct, rows, subtotalSell, grandTotal: subtotalSell };
}
