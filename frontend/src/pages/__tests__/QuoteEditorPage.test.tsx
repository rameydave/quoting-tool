import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { QuoteEditorPage } from '../QuoteEditorPage';

describe('QuoteEditorPage', () => {
  it('renders visible MVP status content', () => {
    render(<QuoteEditorPage />);
    expect(screen.getByText('Quoting Tool MVP')).toBeInTheDocument();
    expect(screen.getByText('Backend: Express scaffold routes are present.')).toBeInTheDocument();
    expect(screen.getByText('Tests: Backend/frontend Vitest suites are included.')).toBeInTheDocument();
  });
});
