import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuoteEditorPage } from '../QuoteEditorPage';

describe('QuoteEditorPage', () => {
  it('renders quote editor controls', () => {
    render(<QuoteEditorPage />);
    expect(screen.getByText('Quote Editor MVP')).toBeInTheDocument();
    expect(screen.getByText('Add DB Part Row')).toBeInTheDocument();
    expect(screen.getByText('Save Revision')).toBeInTheDocument();
  });
});
