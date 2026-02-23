import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartAutocomplete } from '../PartAutocomplete';

const options = [{ id: '1', partNumber: 'ABC-100', description: 'Ball Valve' }];

describe('PartAutocomplete', () => {
  it('renders part number + description only (no price)', async () => {
    render(<PartAutocomplete value='' onChange={vi.fn()} onSelect={vi.fn()} onUseManual={vi.fn()} searchParts={vi.fn().mockResolvedValue(options)} />);
    fireEvent.change(screen.getByLabelText('Part #'), { target: { value: 'A' } });
    await waitFor(() => expect(screen.getByText('ABC-100')).toBeInTheDocument());
    expect(screen.getByText('Ball Valve')).toBeInTheDocument();
    expect(screen.queryByText('11.2')).not.toBeInTheDocument();
  });

  it('shows manual action on no match', async () => {
    render(<PartAutocomplete value='ZZZ' onChange={vi.fn()} onSelect={vi.fn()} onUseManual={vi.fn()} searchParts={vi.fn().mockResolvedValue([])} />);
    fireEvent.focus(screen.getByLabelText('Part #'));
    await waitFor(() => expect(screen.getByText('No matching part found — Use as Manual Part')).toBeInTheDocument());
  });
});
