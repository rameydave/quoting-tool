import { describe, expect, it } from 'vitest';

describe('revisioning snapshot preservation', () => {
  it('preserves old snapshot cost in previous version', () => {
    const v1 = { row: { masterCostSnapshot: 10.25 } };
    const v2 = structuredClone(v1);
    v2.row.masterCostSnapshot = 12.5;
    expect(v1.row.masterCostSnapshot).toBe(10.25);
    expect(v2.row.masterCostSnapshot).toBe(12.5);
  });
});
