export function parseCsv(input: string): string[][] {
  const text = input.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? "";
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(cell);
      cell = "";
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      continue;
    }
    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    if (row.some((value) => value.length > 0)) rows.push(row);
  }

  return rows;
}

export function csvToJson(rows: string[][], useHeaders: boolean): unknown[] {
  if (rows.length === 0) return [];
  if (!useHeaders) return rows;
  const header = rows[0] ?? [];
  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      const name = key.trim() || `column_${index + 1}`;
      record[name] = row[index] ?? "";
    });
    return record;
  });
}

export function toCsv(rows: string[][]): string {
  const lines = rows.map((row) => row.map(escapeCsv).join(","));
  return `\uFEFF${lines.join("\r\n")}`;
}

function escapeCsv(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}
