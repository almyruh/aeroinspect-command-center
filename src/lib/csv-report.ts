import type { LoggedInspection } from "./inspection-log";

export const CSV_DISCLAIMER =
  "Candidate regions from automated edge detection (demonstration system). Not validated aerospace defects; requires qualified inspector review.";

export function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) || /^\s|\s$/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(rows: unknown[][]): string {
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
}

export const REPORT_COLUMNS = [
  "Inspection ID",
  "Inspected at (UTC)",
  "Filename",
  "File size (bytes)",
  "Image width (px)",
  "Image height (px)",
  "Total candidate regions",
  "Mean brightness (0-255)",
  "Edge pixel ratio",
  "Inspection status",
  "Service warning",
  "Service URL",
  "Disclaimer",
] as const;

function row(e: LoggedInspection): unknown[] {
  return [
    e.id,
    e.inspectedAt,
    e.filename,
    e.fileSizeBytes,
    e.width,
    e.height,
    e.totalRegions,
    e.meanBrightness,
    e.edgePixelRatio,
    e.status,
    e.warning,
    e.serviceUrl,
    CSV_DISCLAIMER,
  ];
}

export function inspectionsToCsv(entries: LoggedInspection[]): string {
  return "\uFEFF" + toCsv([[...REPORT_COLUMNS], ...entries.map(row)]);
}

export function reportFilename(entry?: LoggedInspection): string {
  const safe = (s: string) => s.replace(/[^\w.-]+/g, "_");
  return entry ? `aeroinspect-report-${safe(entry.id)}.csv` : `aeroinspect-history-${new Date().toISOString().slice(0, 10)}.csv`;
}

export function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
