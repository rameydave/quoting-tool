import { describe, expect, it, vi } from 'vitest';
import { getQuoteFromDb } from '../quoteDbService.js';

vi.mock('../../lib/prisma.js', () => ({
  prisma: {
    quote: {
      findUnique: vi.fn(async () => ({
        id: 'q1',
        quoteNumber: 'Q-2026-000001',
        versionNo: 1,
        customerName: 'Acme',
        rjaMarkupPct: 0.1,
        repMarkupPct: 0.05,
        totalMarkupPct: 0.15,
        subtotalSell: 100,
        grandTotal: 100,
        rows: [{ id: 'r1', lineOrder: 1, rowType: 'note', partNumber: null, qty: null, description: 'n', masterCostSnapshot: null, overrideCost: null, effectiveCost: null, sellUnitPrice: null, lineTotal: null }],
      })),
    },
  },
}));

describe('quote db mapping', () => {
  it('maps db quote to api shape', async () => {
    const quote = await getQuoteFromDb('q1');
    expect(quote?.quoteNumber).toBe('Q-2026-000001');
    expect(quote?.rows[0].rowType).toBe('note');
  });
});
