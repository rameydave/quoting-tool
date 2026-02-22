import { QuoteInput } from "../types/domain.js";

export function generatePoCsv(quote: QuoteInput): string {
  const lines = ["part_number"];
  for (const row of quote.rows) {
    if (row.rowType === "note") continue;
    if (!row.partNumber || !row.qty || row.qty <= 0) {
      throw new Error("Invalid exportable row for PO CSV");
    }
    for (let i = 0; i < Math.trunc(row.qty); i += 1) {
      lines.push(row.partNumber);
    }
  }
  if (lines.length === 1) throw new Error("No exportable part rows found");
  return `${lines.join("\n")}\n`;
}

export function buildQuoteHtml(quote: QuoteInput): string {
  const rowHtml = quote.rows
    .map((row) => {
      if (row.rowType === "note") {
        return `<tr><td colspan="5" class="note">${row.description ?? ""}</td></tr>`;
      }
      return `<tr><td>${row.partNumber ?? ""}</td><td>${row.qty ?? ""}</td><td>${row.description ?? ""}</td><td class="num">${row.sellUnitPrice?.toFixed(4) ?? ""}</td><td class="num">${row.lineTotal?.toFixed(2) ?? ""}</td></tr>`;
    })
    .join("");

  return `<!doctype html><html><head><style>body{font-family:Arial}th,td{border:1px solid #ccc;padding:6px}table{border-collapse:collapse;width:100%}.num{text-align:right}.note{font-style:italic;white-space:pre-wrap}</style></head><body><h1>QUOTE</h1><p>Quote #: ${quote.quoteNumber} v${quote.versionNo}</p><table><thead><tr><th>Part Number</th><th>Qty</th><th>Description</th><th>Unit Price</th><th>Amount</th></tr></thead><tbody>${rowHtml}</tbody></table></body></html>`;
}
