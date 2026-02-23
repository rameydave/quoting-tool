import { useMemo, useState } from 'react';
import { PartAutocomplete } from '../components/PartAutocomplete';
import { Row, RowType } from '../lib/calc';
import { createQuote, getQuote, QuoteDto, reviseQuote, searchParts } from '../lib/api';

interface QuoteState {
  id: string;
  quoteNumber: string;
  versionNo: number;
  customerName: string;
  rjaMarkupPct: number;
  repMarkupPct: number;
  rows: Row[];
  subtotalSell: number;
  grandTotal: number;
}

const uid = () => crypto.randomUUID();

function toPayload(state: QuoteState): QuoteDto {
  return {
    id: state.id,
    quoteNumber: state.quoteNumber,
    versionNo: state.versionNo,
    customerName: state.customerName,
    rjaMarkupPct: state.rjaMarkupPct,
    repMarkupPct: state.repMarkupPct,
    rows: state.rows.map((row) => ({
      id: row.id,
      rowType: row.rowType,
      partNumber: row.partNumber,
      qty: row.qty,
      description: row.description,
      masterCostSnapshot: row.effectiveCost ?? 0,
    })),
  };
}

function fromDto(dto: QuoteDto): QuoteState {
  return {
    id: dto.id,
    quoteNumber: dto.quoteNumber,
    versionNo: dto.versionNo,
    customerName: dto.customerName,
    rjaMarkupPct: dto.rjaMarkupPct,
    repMarkupPct: dto.repMarkupPct,
    rows: dto.rows,
    subtotalSell: dto.subtotalSell ?? 0,
    grandTotal: dto.grandTotal ?? 0,
  };
}

export function QuoteEditorPage() {
  const [quote, setQuote] = useState<QuoteState>({
    id: uid(),
    quoteNumber: 'Q-2026-000001',
    versionNo: 1,
    customerName: '',
    rjaMarkupPct: 0.1,
    repMarkupPct: 0.05,
    rows: [],
    subtotalSell: 0,
    grandTotal: 0,
  });
  const [loadId, setLoadId] = useState('');
  const [status, setStatus] = useState('');

  const pricedCount = useMemo(() => quote.rows.filter((r) => r.rowType !== 'note').length, [quote.rows]);

  const addRow = (type: RowType) => {
    setQuote((prev) => ({ ...prev, rows: [...prev.rows, { id: uid(), rowType: type, qty: type === 'note' ? undefined : 1, description: '' }] }));
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    setQuote((prev) => ({ ...prev, rows: prev.rows.map((row) => row.id === id ? { ...row, ...patch } : row) }));
  };

  const onSave = async () => {
    try {
      const saved = await createQuote(toPayload(quote));
      setQuote(fromDto(saved));
      setStatus('Saved quote via POST /quotes');
    } catch {
      setStatus('Save failed (check backend + unique IDs).');
    }
  };

  const onLoad = async () => {
    try {
      const loaded = await getQuote(loadId.trim());
      setQuote(fromDto(loaded));
      setStatus('Loaded quote via GET /quotes/:id');
    } catch {
      setStatus('Load failed.');
    }
  };

  const onRevise = async () => {
    try {
      const revised = await reviseQuote(quote.id);
      setQuote(fromDto(revised));
      setStatus('Revised quote via POST /quotes/:id/revise');
    } catch {
      setStatus('Revise failed.');
    }
  };

  return (
    <main style={{ fontFamily: 'Arial, sans-serif', padding: 16 }}>
      <h1>Quote Editor MVP</h1>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <input aria-label='Quote Id' value={quote.id} readOnly placeholder='Quote ID' />
        <input aria-label='Quote Number' value={quote.quoteNumber} onChange={(e) => setQuote((p) => ({ ...p, quoteNumber: e.target.value }))} placeholder='Quote #' />
        <input aria-label='Customer Name' value={quote.customerName} onChange={(e) => setQuote((p) => ({ ...p, customerName: e.target.value }))} placeholder='Customer Name' />
        <button onClick={onSave}>Save</button>
        <button onClick={onRevise}>Save Revision</button>
        <input aria-label='Load Quote Id' value={loadId} onChange={(e) => setLoadId(e.target.value)} placeholder='Quote ID to load' />
        <button onClick={onLoad}>Load</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => addRow('db_part')}>Add DB Part Row</button>
        <button onClick={() => addRow('manual_part')}>Add Manual Part Row</button>
        <button onClick={() => addRow('note')}>Add Note Row</button>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Type</th><th>Part #</th><th>Qty</th><th>Description / Note</th><th>Base Cost</th><th>Line Total</th></tr>
        </thead>
        <tbody>
          {quote.rows.map((row) => (
            <tr key={row.id}>
              <td>{row.rowType}</td>
              <td>
                {row.rowType === 'db_part' && (
                  <PartAutocomplete
                    value={row.partNumber ?? ''}
                    onChange={(value) => updateRow(row.id, { partNumber: value })}
                    searchParts={searchParts}
                    onSelect={(part) => updateRow(row.id, { partNumber: part.partNumber, description: part.description })}
                    onUseManual={(typedValue) => updateRow(row.id, { rowType: 'manual_part', partNumber: typedValue })}
                  />
                )}
                {row.rowType === 'manual_part' && (
                  <input value={row.partNumber ?? ''} onChange={(e) => updateRow(row.id, { partNumber: e.target.value })} />
                )}
              </td>
              <td>{row.rowType === 'note' ? '' : <input type='number' value={row.qty ?? 1} onChange={(e) => updateRow(row.id, { qty: Number(e.target.value) })} />}</td>
              <td><textarea value={row.description ?? ''} onChange={(e) => updateRow(row.id, { description: e.target.value })} /></td>
              <td>{row.rowType === 'note' ? '' : <input type='number' value={row.effectiveCost ?? 0} onChange={(e) => updateRow(row.id, { effectiveCost: Number(e.target.value) })} />}</td>
              <td>{row.rowType === 'note' ? '' : (row.lineTotal ?? 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section style={{ marginTop: 12 }}>
        <div>Priced rows: {pricedCount}</div>
        <div>Subtotal (server): {quote.subtotalSell.toFixed(2)}</div>
        <div>Grand Total (server): {quote.grandTotal.toFixed(2)}</div>
        <div>Status: {status}</div>
        <div>Quote ID: {quote.id}</div>
        <div>Version: v{quote.versionNo}</div>
      </section>
    </main>
  );
}
