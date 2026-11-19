import { Contrast, Hash, Ruler, ScanLine, ShieldQuestion } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatBrightness, formatDims, formatRatio, statusTone, type InspectResult } from "@/lib/inspect-api";

const TONE = {
  success: "border-success/40 bg-success/8 text-success",
  warning: "border-warning/40 bg-warning/8 text-warning",
  danger: "border-destructive/40 bg-destructive/8 text-destructive",
  neutral: "border-border bg-surface text-foreground",
} as const;

export function MetricGrid({ result }: { result: Omit<InspectResult, "annotatedImage"> }) {
  const tone = statusTone(result.status, result.totalRegions);
  const items = [
    { label: "Candidate regions", value: result.totalRegions === null ? "—" : String(result.totalRegions), icon: Hash, sub: "Edge-detected, unvalidated" },
    { label: "Image dimensions", value: formatDims(result), icon: Ruler, sub: "Width × height" },
    { label: "Mean brightness", value: formatBrightness(result.meanBrightness), icon: Contrast, sub: "Grayscale intensity" },
    { label: "Edge pixel ratio", value: formatRatio(result.edgePixelRatio), icon: ScanLine, sub: "Share of pixels on edges" },
  ];
  return (
    <div className="space-y-3">
      <div className={cn("rounded-lg border p-4", TONE[tone])}>
        <div className="flex items-center gap-2">
          <ShieldQuestion className="size-4" />
          <p className="eyebrow !text-current">Inspection status</p>
        </div>
        <p className="mt-1 font-display text-2xl font-semibold">{result.status}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">Reported by the inspection service, shown as received.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {items.map((m) => (
          <div key={m.label} className="rounded-lg border border-border bg-surface p-3.5">
            <div className="flex items-center justify-between">
              <p className="eyebrow !text-[10px]">{m.label}</p>
              <m.icon className="size-3.5 text-primary" />
            </div>
            <p className="mt-2 font-mono text-lg font-semibold">{m.value}</p>
            <p className="text-[11px] text-muted-foreground">{m.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
