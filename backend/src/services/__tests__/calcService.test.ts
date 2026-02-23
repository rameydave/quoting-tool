import { describe, expect, it } from 'vitest';
import { recalculateQuote } from '../calcService.js';

describe('quote calculations', () => {
  it('applies rounding rules and ignores note totals', () => {
    const result = recalculateQuote({
      id: 'q1', quoteNumber: 'Q-2026-000001', versionNo: 1, customerName: 'Acme', rjaMarkupPct: 0.1, repMarkupPct: 0.05,
      rows: [
        { id: '1', rowType: 'db_part', qty: 2.5, masterCostSnapshot: 10.12345 },
        { id: '2', rowType: 'note', description: 'note' }
      ]
    });
    expect(result.rows[0].sellUnitPrice).toBe(11.642);
    expect(result.rows[0].lineTotal).toBe(29.1);
    expect(result.subtotalSell).toBe(29.1);
  });
});
