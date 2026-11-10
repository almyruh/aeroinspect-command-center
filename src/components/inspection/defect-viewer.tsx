import { Crosshair, Layers, ScanSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DEFECT_META, type Defect } from "@/lib/inspection-data";

export function DefectViewer({
  image,
  defects,
  analyzing,
  progress,
  showOverlay,
  onToggleOverlay,
  activeId,
  onHover,
  caption,
}: {
  image: string;
  defects: Defect[];
  analyzing: boolean;
  progress: number;
  showOverlay: boolean;
  onToggleOverlay: (v: boolean) => void;
  activeId: string | null;
  onHover: (id: string | null) => void;
  caption: string;
}) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <Crosshair className="size-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-medium">{caption}</p>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="size-3.5" />
          Defect overlay
          <Switch checked={showOverlay} onCheckedChange={onToggleOverlay} />
        </label>
      </div>

      <div className="hud-frame relative aspect-[10/7] w-full bg-background">
        <img src={image} alt={caption} width={1280} height={896} className="absolute inset-0 size-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-40" />

        {analyzing && (
          <>
            <div className="absolute inset-0 bg-background/45" />
            <div className="absolute inset-x-0 h-0.5 animate-scan-y bg-primary shadow-glow" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="panel flex items-center gap-3 px-4 py-3">
                <ScanSearch className="size-5 animate-blink text-primary" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-[0.14em] text-primary">
                    Simulating analysis · {Math.round(progress)}%
                  </p>
                  <p className="text-[11px] text-muted-foreground">Demo sequence — no model inference</p>
                </div>
              </div>
            </div>
          </>
        )}

        {!analyzing &&
          showOverlay &&
          defects.map((d) => {
            const m = DEFECT_META[d.type];
            const active = activeId === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onMouseEnter={() => onHover(d.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(d.id)}
                onBlur={() => onHover(null)}
                className={cn(
                  "absolute rounded-sm border-2 transition-all",
                  m.borderClass,
                  active ? "z-10 bg-foreground/10" : "bg-transparent",
                )}
                style={{
                  left: `${d.box.x}%`,
                  top: `${d.box.y}%`,
                  width: `${d.box.w}%`,
                  height: `${d.box.h}%`,
                  boxShadow: active ? `0 0 0 3px color-mix(in oklab, ${m.colorVar} 35%, transparent), 0 0 24px ${m.colorVar}` : undefined,
                }}
                aria-label={`${m.label} ${d.id}, ${Math.round(d.confidence * 100)}% confidence`}
              >
                <span
                  className={cn(
                    "absolute -top-6 left-[-2px] whitespace-nowrap rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold text-background",
                    m.bgClass,
                  )}
                >
                  {d.id} · {Math.round(d.confidence * 100)}%
                </span>
              </button>
            );
          })}

        <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-foreground/80">
          {analyzing ? "Scanning…" : `${defects.length} region${defects.length === 1 ? "" : "s"} flagged`} · Demo annotations
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 border-t border-border px-4 py-2.5">
        {(Object.keys(DEFECT_META) as (keyof typeof DEFECT_META)[]).map((t) => (
          <div key={t} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn("size-2.5 rounded-[2px]", DEFECT_META[t].bgClass)} />
            {DEFECT_META[t].label}
          </div>
        ))}
      </div>
    </div>
  );
}
