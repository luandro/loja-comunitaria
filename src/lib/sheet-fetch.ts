/**
 * Reads a public Google Sheet tab directly from Google (CSV export) with no
 * relay service. Falls back to the OpenSheet proxy only if Google fails.
 */

/** RFC 4180 CSV parser: quoted fields, escaped quotes, newlines inside quotes. */
export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** CSV text → objects keyed by header; blank rows and blank headers dropped. */
export function csvToObjects(text: string): Array<Record<string, string>> {
  const [header, ...body] = parseCsvRows(text);
  if (!header) return [];
  const keys = header.map((h) => h.trim());
  return body
    .filter((r) => r.some((v) => v.trim() !== ''))
    .map((r) => {
      const obj: Record<string, string> = {};
      keys.forEach((k, i) => {
        if (k) obj[k] = (r[i] ?? '').trim();
      });
      return obj;
    });
}

export function googleCsvUrl(spreadsheetId: string, tab: string): string {
  return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(
    spreadsheetId,
  )}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
}

async function fromGoogle(spreadsheetId: string, tab: string) {
  const res = await fetch(googleCsvUrl(spreadsheetId, tab));
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  // A private/unpublished sheet answers with an HTML login page, not CSV.
  if (/^\s*<(!doctype|html)/i.test(text)) throw new Error('Planilha não está pública');
  return csvToObjects(text);
}

async function fromOpenSheet(spreadsheetId: string, tab: string) {
  const res = await fetch(`https://opensheet.elk.sh/${spreadsheetId}/${encodeURIComponent(tab)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data)) throw new Error('Resposta inesperada da planilha');
  return data as Array<Record<string, string>>;
}

/** Rows of a tab. Google first, OpenSheet as backup. Throws if both fail. */
export async function fetchSheetRows(
  spreadsheetId: string,
  tab: string,
): Promise<Array<Record<string, string>>> {
  try {
    return await fromGoogle(spreadsheetId, tab);
  } catch (googleErr) {
    if (import.meta.env.DEV) console.warn('[SHEET] Google CSV failed, trying OpenSheet:', googleErr);
    try {
      return await fromOpenSheet(spreadsheetId, tab);
    } catch {
      throw googleErr instanceof Error ? googleErr : new Error(String(googleErr));
    }
  }
}
