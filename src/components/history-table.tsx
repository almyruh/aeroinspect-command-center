import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/status-badge";
import { DEFECT_META, type Inspection } from "@/lib/inspection-data";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Deterministic UTC formatting so server and browser render identical text. */
export function formatUtc(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getUTCDate())} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}Z`;
}

export function HistoryTable({ rows }: { rows: Inspection[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {["Inspection", "Component", "Aircraft / Engine", "Defects", "Max conf.", "Inspector", "Date", "Status"].map((h) => (
              <th key={h} className="eyebrow px-4 py-2.5 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const max = r.defects.length ? Math.max(...r.defects.map((d) => d.confidence)) : null;
            return (
              <tr key={r.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-surface-raised/60">
                <td className="px-4 py-3 font-mono text-xs text-primary">{r.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {r.image ? (
                      <img src={r.image} alt="" width={40} height={28} loading="lazy" className="h-7 w-10 rounded-sm border border-border object-cover" />
                    ) : (
                      <div className="h-7 w-10 rounded-sm border border-border bg-blueprint" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium">{r.component}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">{r.partNumber} · {r.serial}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.aircraft}</td>
                <td className="px-4 py-3">
                  {r.defects.length === 0 ? (
                    <span className="text-xs text-muted-foreground">None</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {r.defects.map((d) => (
                        <span
                          key={d.id}
                          className={cn(
                            "rounded-sm border px-1.5 py-0.5 font-mono text-[10px]",
                            DEFECT_META[d.type].borderClass,
                            DEFECT_META[d.type].textClass,
                          )}
                        >
                          {DEFECT_META[d.type].code}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-mono text-xs">{max ? `${Math.round(max * 100)}%` : "—"}</td>
                <td className="px-4 py-3 text-xs">{r.inspector}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {formatUtc(r.date)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
