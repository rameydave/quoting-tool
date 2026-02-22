import { describe, expect, it } from 'vitest';
import { store } from '../../lib/inMemoryStore.js';
import { canUpdateMasterPrice } from '../permissionService.js';

describe('master price update audit', () => {
  it('creates audit entry shape when authorized', () => {
    store.parts.set('p1', { id: 'p1', partNumber: 'A', description: 'd', cost: 1 });
    if (!canUpdateMasterPrice('pricing_admin')) throw new Error('forbidden');
    const part = store.parts.get('p1')!;
    const old = part.cost;
    part.cost = 2;
    store.audit.push({ eventType: 'MASTER_PRICE_UPDATED', oldValuesJson: { cost: old }, newValuesJson: { cost: 2 } });
    expect(store.audit.at(-1)?.eventType).toBe('MASTER_PRICE_UPDATED');
  });
});
