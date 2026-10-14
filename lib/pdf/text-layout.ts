export type TextMark = {
  text: string;
  x: number;
  y: number;
  width: number;
};

export type LaidOutPage = {
  lines: string[];
  rows: string[][];
};

const Y_TOLERANCE = 2.8;
const COLUMN_GAP = 12;

type RawItem = {
  str?: string;
  transform?: number[];
  width?: number;
};

export function layoutTextItems(items: readonly unknown[]): LaidOutPage {
  const marks: TextMark[] = [];
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    const raw = item as RawItem;
    if (!raw.str || !raw.transform) continue;
    marks.push({
      text: raw.str,
      x: raw.transform[4] ?? 0,
      y: raw.transform[5] ?? 0,
      width: raw.width ?? raw.str.length * 4,
    });
  }

  const rows = groupRows(marks);
  return {
    lines: rows.map((row) => joinLine(row)),
    rows: rows.map((row) => splitCells(row)).filter((row) => row.some((cell) => cell.trim())),
  };
}

export function hasExtractedText(pages: LaidOutPage[]): boolean {
  return pages.some((page) => page.lines.some((line) => line.trim().length > 0));
}

function groupRows(marks: TextMark[]): TextMark[][] {
  const sorted = [...marks].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: { y: number; marks: TextMark[] }[] = [];
  for (const mark of sorted) {
    const row = rows.find((entry) => Math.abs(entry.y - mark.y) <= Y_TOLERANCE);
    if (row) row.marks.push(mark);
    else rows.push({ y: mark.y, marks: [mark] });
  }
  return rows.map((row) => row.marks.sort((a, b) => a.x - b.x));
}

function joinLine(marks: TextMark[]): string {
  let line = "";
  let lastEnd = Number.NEGATIVE_INFINITY;
  for (const mark of marks) {
    if (line && mark.x - lastEnd > 1.2) line += " ";
    line += mark.text;
    lastEnd = mark.x + mark.width;
  }
  return line.replace(/[ \t]+/g, " ").trim();
}

function splitCells(marks: TextMark[]): string[] {
  const cells: string[] = [];
  let current = "";
  let lastEnd = Number.NEGATIVE_INFINITY;
  for (const mark of marks) {
    const gap = mark.x - lastEnd;
    if (current && gap > COLUMN_GAP) {
      cells.push(current.trim());
      current = mark.text;
    } else if (current && gap > 1.2) {
      current += ` ${mark.text}`;
    } else {
      current += mark.text;
    }
    lastEnd = mark.x + mark.width;
  }
  if (current.trim()) cells.push(current.trim());
  return cells;
}
