import { CheckCircle2, ClipboardList, ShieldAlert, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { DemoBadge } from "@/components/demo-notice";
import { StatusBadge } from "@/components/status-badge";
import {
  DEFECT_META,
  DEFECT_TYPES,
  type Defect,
  type InspectionStatus,
} from "@/lib/inspection-data";

const STATUS_COPY: Record<InspectionStatus, { title: string; body: string; icon: typeof XCircle; tone: string; ring: string }> = {
  fail: {
    title: "Component rejected",
    body: "Critical finding exceeds allowable limits. Remove from service.",
    icon: XCircle,
    tone: "text-destructive",
    ring: "border-destructive/40 bg-destructive/8",
  },
  review: {
    title: "Engineering review required",
    body: "Findings require disposition against SRM limits.",
    icon: ShieldAlert,
    tone: "text-warning",
    ring: "border-warning/40 bg-warning/8",
  },
  pass: {
    title: "Serviceable",
    body: "No reportable surface defects flagged.",
    icon: CheckCircle2,
    tone: "text-success",
    ring: "border-success/40 bg-success/8",
  },
};

const SEVERITY_TONE = {
  critical: "text-destructive",
  major: "text-warning",
  minor: "text-muted-foreground",
} as const;

export function ResultsPanel({
  status,
  defects,
  analyzing,
  meta,
  activeId,
  onHover,
  uploaded,
}: {
  status: InspectionStatus;
  defects: Defect[];
  analyzing: boolean;
  meta: { id: string; component: string; partNumber: string; serial: string; durationSec: number };
  activeId: string | null;
  onHover: (id: string | null) => void;
  uploaded: boolean;
}) {
  const s = STATUS_COPY[status];
  const avg = defects.length ? defects.reduce((a, d) => a + d.confidence, 0) / defects.length : 0;

  return (
    <div className="panel flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="size-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Inspection Results</h2>
        </div>
        <DemoBadge />
      </div>

      {analyzing ? (
        <div className="flex flex-1 flex-col gap-3 p-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-md bg-muted" />
          ))}
          <p className="text-center text-xs text-muted-foreground">Preparing demonstration results…</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-5 p-5">
          <div className={cn("rounded-lg border p-4", s.ring)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <s.icon className={cn("size-5", s.tone)} />
                <p className={cn("font-display text-lg font-semibold", s.tone)}>{s.title}</p>
              </div>
              <StatusBadge status={status} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{s.body}</p>
            {uploaded && (
              <p className="mt-2 text-xs font-medium text-warning">
                Simulated result — your image was not analysed. Findings are placeholders.
              </p>
            )}
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
            {[
              ["Inspection ID", meta.id],
              ["Component", meta.component],
              ["Part number", meta.partNumber],
              ["Serial", meta.serial],
              ["Mean confidence", defects.length ? `${(avg * 100).toFixed(1)}%` : "—"],
              ["Processing", `${meta.durationSec.toFixed(1)} s (simulated)`],
            ].map(([k, v]) => (
              <div key={k} className="min-w-0">
                <dt className="eyebrow !text-[10px]">{k}</dt>
                <dd className="mt-0.5 truncate font-mono text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="eyebrow mb-2">Defect categories</p>
            <div className="grid grid-cols-4 gap-2">
              {DEFECT_TYPES.map((t) => {
                const n = defects.filter((d) => d.type === t).length;
                const m = DEFECT_META[t];
                return (
                  <div
                    key={t}
                    className={cn("rounded-md border bg-surface p-2.5 text-center", !n && "border-border opacity-60")}
                    style={n ? { borderColor: `color-mix(in oklab, ${m.colorVar} 50%, transparent)` } : undefined}
                  >
                    <p className={cn("font-display text-2xl font-semibold", n ? m.textClass : "text-muted-foreground")}>{n}</p>
                    <p className="text-[11px] text-muted-foreground">{m.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <p className="eyebrow mb-2">Flagged regions</p>
            {defects.length === 0 ? (
              <p className="rounded-md border border-border bg-surface p-4 text-sm text-muted-foreground">
                No defects flagged.
              </p>
            ) : (
              <ul className="space-y-2">
                {defects.map((d) => {
                  const m = DEFECT_META[d.type];
                  const pct = Math.round(d.confidence * 100);
                  return (
                    <li
                      key={d.id}
                      onMouseEnter={() => onHover(d.id)}
                      onMouseLeave={() => onHover(null)}
                      className={cn(
                        "rounded-md border bg-surface p-3 transition-colors",
                        activeId === d.id ? "border-primary/60 bg-accent" : "border-border",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={cn("size-2.5 rounded-[2px]", m.bgClass)} />
                          <span className="font-mono text-xs font-semibold">{d.id}</span>
                          <span className="text-sm font-medium">{m.label}</span>
                        </div>
                        <span className={cn("font-mono text-[10px] uppercase tracking-[0.12em]", SEVERITY_TONE[d.severity])}>
                          {d.severity}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {d.location} · {d.size}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className={cn("h-full rounded-full", m.bgClass)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">{pct}% conf.</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
