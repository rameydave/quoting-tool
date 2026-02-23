import { describe, expect, it } from 'vitest';
import { canUpdateMasterPrice } from '../permissionService.js';

describe('permissions', () => {
  it('estimator cannot update master price', () => {
    expect(canUpdateMasterPrice('estimator')).toBe(false);
  });
});
