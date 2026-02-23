import { RowType } from './calc';
import { PartOption } from '../components/PartAutocomplete';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://localhost:4000';

export interface QuoteRowDto {
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

export interface QuoteDto {
  id: string;
  quoteNumber: string;
  versionNo: number;
  customerName: string;
  rjaMarkupPct: number;
  repMarkupPct: number;
  totalMarkupPct?: number;
  subtotalSell?: number;
  grandTotal?: number;
  rows: QuoteRowDto[];
}

export async function searchParts(query: string): Promise<PartOption[]> {
  const res = await fetch(`${API_BASE}/parts/search?q=${encodeURIComponent(query)}&limit=20`);
  if (!res.ok) return [];
  return res.json();
}

export async function createQuote(payload: QuoteDto): Promise<QuoteDto> {
  const res = await fetch(`${API_BASE}/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Save failed');
  return res.json();
}

export async function getQuote(id: string): Promise<QuoteDto> {
  const res = await fetch(`${API_BASE}/quotes/${id}`);
  if (!res.ok) throw new Error('Load failed');
  return res.json();
}

export async function reviseQuote(id: string): Promise<QuoteDto> {
  const res = await fetch(`${API_BASE}/quotes/${id}/revise`, { method: 'POST' });
  if (!res.ok) throw new Error('Revise failed');
  return res.json();
}
