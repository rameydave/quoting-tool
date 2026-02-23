import { describe, expect, it } from 'vitest';
import { generatePoCsv, buildQuoteHtml } from '../exportService.js';

describe('PO CSV export', () => {
  it('excludes note rows and pricing', () => {
    const csv = generatePoCsv({
      id: 'q1', quoteNumber: 'Q-2026-000001', versionNo: 1, customerName: 'Acme', rjaMarkupPct: 0, repMarkupPct: 0,
      rows: [
        { id: '1', rowType: 'db_part', partNumber: 'ABC-100', qty: 2 },
        { id: '2', rowType: 'note', description: 'note row' },
      ]
    });
    expect(csv).toBe('part_number\nABC-100\nABC-100\n');
  });

  it('pdf path includes note rendering', () => {
    const html = buildQuoteHtml({
      id: 'q1', quoteNumber: 'Q-2026-000001', versionNo: 2, customerName: 'Acme', rjaMarkupPct: 0, repMarkupPct: 0,
      rows: [{ id: 'n1', rowType: 'note', description: 'full width note' }]
    });
    expect(html).toContain('colspan="5"');
    expect(html).toContain('full width note');
  });
});
