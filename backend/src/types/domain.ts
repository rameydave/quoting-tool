export type Role = "estimator" | "pricing_admin" | "admin";
export type RowType = "db_part" | "manual_part" | "note";

export interface QuoteRowInput {
  id: string;
  rowType: RowType;
  partNumber?: string;
  qty?: number;
  description?: string;
  masterCostSnapshot?: number;
  overrideCost?: number;
  effectiveCost?: number;
  sellUnitPrice?: number;
  lineTotal?: number;
}

export interface QuoteInput {
  id: string;
  quoteNumber: string;
  versionNo: number;
  customerName: string;
  rjaMarkupPct: number;
  repMarkupPct: number;
  totalMarkupPct?: number;
  rows: QuoteRowInput[];
  subtotalSell?: number;
  grandTotal?: number;
}
