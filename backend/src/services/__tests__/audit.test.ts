import { describe, expect, it, vi } from 'vitest';
import { updateMasterPriceWithAudit } from '../pricingDbService.js';

vi.mock('../../lib/prisma.js', () => {
  const part = { id: 'p1', partNumber: 'ABC-100', description: 'Valve', cost: 1 };
  return {
    prisma: {
      $transaction: async (cb: any) => cb({
        part: {
          findUnique: vi.fn(async () => part),
          update: vi.fn(async ({ data }: any) => ({ ...part, cost: data.cost })),
        },
        auditLog: {
          create: vi.fn(async () => ({})),
        },
      }),
    },
  };
});

describe('master price update audit', () => {
  it('writes update + audit in one transactional flow', async () => {
    const updated = await updateMasterPriceWithAudit({
      userId: 'u1', userName: 'QA', partId: 'p1', newCost: 2.5, reason: 'market'
    });
    expect(updated?.partNumber).toBe('ABC-100');
    expect(Number(updated?.cost)).toBe(2.5);
  });
});
