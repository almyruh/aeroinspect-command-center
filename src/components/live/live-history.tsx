import { Download, Trash2 } from "lucide-react";
import { useHydrated } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { clearInspectionLog, useInspectionLog } from "@/lib/inspection-log";
import { downloadCsv, inspectionsToCsv, reportFilename } from "@/lib/csv-report";
import { formatBrightness, formatDims, formatRatio, statusTone } from "@/lib/inspect-api";

const TONE = { success: "success", warning: "warning", danger: "danger", neutral: "signal" } as const;

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function LiveHistory({ limit }: { limit?: number }) {
  const hydrated = useHydrated();
  const all = useInspectionLog();
  const rows = limit ? all.slice(0, limit) : all;

  return (
    <section className="panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Recent inspections</h2>
          <p className="text-xs text-muted-foreground">Inspections run from this browser · saved on this device only</p>
        </div>
        <div className="flex items-center gap-2">
          {all.length > 0 && (
            <>
              <Button variant="ghost" size="sm" onClick={() => confirm("Clear all recent inspections from this browser?") && clearInspectionLog()}>
                <Trash2 /> Clear
              </Button>
              <Button variant="panel" size="sm" onClick={() => downloadCsv(inspectionsToCsv(all), reportFilename())}>
                <Download /> Export CSV
              </Button>
            </>
          )}
        </div>
      </div>

      {!hydrated ? (
        <div className="h-24" aria-hidden />
      ) : rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">
          No inspections yet. Results appear here after you inspect an image.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                {["Inspection", "File", "Dimensions", "Candidate regions", "Brightness", "Edge ratio", "Status", ""].map((h) => (
                  <th key={h} className="eyebrow px-5 py-2.5 !text-[10px] font-normal">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-surface/60">
                  <td className="px-5 py-3">
                    <p className="whitespace-nowrap font-mono text-xs font-semibold">{r.id}</p>
                    <p className="text-[11px] text-muted-foreground">{when(r.inspectedAt)}</p>
                  </td>
                  <td className="max-w-[220px] truncate px-5 py-3" title={r.filename}>
                    {r.filename}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{formatDims(r)}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{r.totalRegions ?? "—"}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{formatBrightness(r.meanBrightness)}</td>
                  <td className="whitespace-nowrap px-5 py-3 font-mono text-xs">{formatRatio(r.edgePixelRatio)}</td>
                  <td className="px-5 py-3">
                    <Badge variant={TONE[statusTone(r.status, r.totalRegions)]} className={cn("max-w-[180px] truncate font-mono text-[10px]")}>
                      {r.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => downloadCsv(inspectionsToCsv([r]), reportFilename(r))} aria-label={`Download CSV for ${r.id}`}>
                      <Download /> CSV
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {hydrated && limit && all.length > limit && (
        <p className="border-t border-border px-5 py-2.5 font-mono text-[11px] text-muted-foreground">
          Showing {limit} of {all.length} · full list on Inspection History
        </p>
      )}
    </section>
  );
}
