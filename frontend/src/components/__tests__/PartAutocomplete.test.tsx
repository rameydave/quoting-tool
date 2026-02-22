import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartAutocomplete } from '../PartAutocomplete';

const options = [{ id: '1', partNumber: 'ABC-100', description: 'Ball Valve', cost: 11.2 }];

describe('PartAutocomplete', () => {
  it('renders part number + description only (no price)', () => {
    render(<PartAutocomplete options={options} onSelect={vi.fn()} onUseManual={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Part #'), { target: { value: 'A' } });
    expect(screen.getByText('ABC-100')).toBeInTheDocument();
    expect(screen.getByText('Ball Valve')).toBeInTheDocument();
    expect(screen.queryByText('11.2')).not.toBeInTheDocument();
  });

  it('shows manual action on no match', () => {
    render(<PartAutocomplete options={options} onSelect={vi.fn()} onUseManual={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Part #'), { target: { value: 'ZZZ' } });
    expect(screen.getByText('No matching part found — Use as Manual Part')).toBeInTheDocument();
  });
});
