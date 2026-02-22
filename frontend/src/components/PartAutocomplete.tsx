import { useMemo, useState } from 'react';

interface PartOption { id: string; partNumber: string; description: string; cost?: number }

export function PartAutocomplete({ options, onSelect, onUseManual }: { options: PartOption[]; onSelect: (part: PartOption) => void; onUseManual: () => void; }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const starts = options.filter(p => p.partNumber.toLowerCase().startsWith(q));
    const contains = options.filter(p => !p.partNumber.toLowerCase().startsWith(q) && p.partNumber.toLowerCase().includes(q));
    const desc = options.filter(p => !p.partNumber.toLowerCase().includes(q) && p.description.toLowerCase().includes(q));
    return [...starts, ...contains, ...desc].slice(0, 20);
  }, [query, options]);

  return <div>
    <input aria-label='Part #' value={query} onChange={(e)=>{setQuery(e.target.value);setOpen(true);}} onKeyDown={(e)=>{
      if (e.key === 'ArrowDown') { setHighlighted(h => Math.min(h + 1, Math.max(filtered.length - 1, 0))); e.preventDefault(); }
      if (e.key === 'ArrowUp') { setHighlighted(h => Math.max(h - 1, 0)); e.preventDefault(); }
      if (e.key === 'Escape') setOpen(false);
      if (e.key === 'Enter' && filtered[highlighted]) { onSelect(filtered[highlighted]); setOpen(false); e.preventDefault(); }
    }} />
    {open && <ul aria-label='results'>
      {filtered.map((p, idx) => <li key={p.id} aria-selected={idx===highlighted} onMouseDown={()=>onSelect(p)}><strong>{p.partNumber}</strong> <span>{p.description}</span></li>)}
      {filtered.length === 0 && <li><button onMouseDown={onUseManual}>No matching part found — Use as Manual Part</button></li>}
    </ul>}
  </div>
}
