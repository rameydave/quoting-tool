export type RowType = 'db_part' | 'manual_part' | 'note';
export interface Row { id: string; rowType: RowType; qty?: number; partNumber?: string; description?: string; effectiveCost?: number; lineTotal?: number }

export const calculateSubtotal = (rows: Row[]) => rows.filter(r => r.rowType !== 'note').reduce((sum, r) => sum + (r.lineTotal ?? 0), 0);
