import { useEffect, useState } from 'react';

export interface PartOption {
  id: string;
  partNumber: string;
  description: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (part: PartOption) => void;
  onUseManual: (typedValue: string) => void;
  searchParts: (query: string) => Promise<PartOption[]>;
}

export function PartAutocomplete({ value, onChange, onSelect, onUseManual, searchParts }: Props) {
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const [results, setResults] = useState<PartOption[]>([]);

  useEffect(() => {
    let cancelled = false;
    if (!value.trim()) {
      setResults([]);
      return;
    }
    searchParts(value).then((items) => {
      if (!cancelled) {
        setResults(items);
        setHighlighted(0);
      }
    }).catch(() => {
      if (!cancelled) setResults([]);
    });
    return () => { cancelled = true; };
  }, [value, searchParts]);

  return <div>
    <input
      aria-label='Part #'
      value={value}
      onChange={(e) => { onChange(e.target.value); setOpen(true); }}
      onFocus={() => setOpen(true)}
      onKeyDown={(e) => {
        if (e.key === 'ArrowDown') { setHighlighted(h => Math.min(h + 1, Math.max(results.length - 1, 0))); e.preventDefault(); }
        if (e.key === 'ArrowUp') { setHighlighted(h => Math.max(h - 1, 0)); e.preventDefault(); }
        if (e.key === 'Escape') setOpen(false);
        if (e.key === 'Enter' && results[highlighted]) { onSelect(results[highlighted]); setOpen(false); e.preventDefault(); }
      }}
    />
    {open && <ul aria-label='results'>
      {results.map((p, idx) => <li key={p.id} aria-selected={idx === highlighted} onMouseDown={() => { onSelect(p); setOpen(false); }}><strong>{p.partNumber}</strong> <span>{p.description}</span></li>)}
      {results.length === 0 && value.trim().length > 0 && <li><button onMouseDown={() => { onUseManual(value); setOpen(false); }}>No matching part found — Use as Manual Part</button></li>}
    </ul>}
  </div>;
}
