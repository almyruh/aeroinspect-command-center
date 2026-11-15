import { useState } from "react";
import { Columns2, SplitSquareHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Slider } from "@/components/ui/slider";

function Frame({ src, label, tone }: { src: string; label: string; tone: "muted" | "primary" }) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 flex items-center gap-2">
        <span className={cn("size-1.5 rounded-full", tone === "primary" ? "bg-primary" : "bg-muted-foreground")} />
        <span className="eyebrow">{label}</span>
      </figcaption>
      <div className="hud-frame overflow-hidden rounded-md border border-border bg-background">
        <img src={src} alt={label} className="block h-auto max-h-[520px] w-full object-contain" />
      </div>
    </figure>
  );
}

export function ImageCompare({ original, annotated }: { original: string; annotated: string | null }) {
  const [mode, setMode] = useState<"side" | "swipe">("side");
  const [pos, setPos] = useState(50);

  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <div>
          <p className="eyebrow">Visual comparison</p>
          <h3 className="font-display text-base font-semibold">Original vs annotated</h3>
        </div>
        {annotated && (
          <div className="flex rounded-md border border-border bg-surface p-0.5" role="group" aria-label="Comparison mode">
            {(
              [
                ["side", "Side by side", Columns2],
                ["swipe", "Swipe", SplitSquareHorizontal],
              ] as const
            ).map(([m, label, Icon]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                aria-pressed={mode === m}
                className={cn(
                  "flex items-center gap-1.5 rounded px-2.5 py-1 text-xs transition-colors",
                  mode === m ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-3.5" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        {!annotated ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Frame src={original} label="Original" tone="muted" />
            <div className="grid min-h-48 place-items-center rounded-md border border-dashed border-border-strong p-6 text-center text-sm text-muted-foreground">
              The service did not return an annotated image.
            </div>
          </div>
        ) : mode === "side" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Frame src={original} label="Original" tone="muted" />
            <Frame src={annotated} label="Annotated · candidate regions" tone="primary" />
          </div>
        ) : (
          <div>
            <div className="hud-frame relative overflow-hidden rounded-md border border-border bg-background">
              <img src={annotated} alt="Annotated image with candidate regions" className="block h-auto max-h-[620px] w-full object-contain" />
              <img
                src={original}
                alt="Original image"
                className="absolute inset-0 block size-full object-contain"
                style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
              />
              <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary shadow-glow" style={{ left: `${pos}%` }} />
              <span className="absolute left-3 top-3 rounded-sm bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em]">
                Original
              </span>
              <span className="absolute right-3 top-3 rounded-sm bg-background/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-primary">
                Annotated
              </span>
            </div>
            <Slider className="mt-4" value={[pos]} min={0} max={100} step={1} onValueChange={([v]) => setPos(v ?? 50)} aria-label="Comparison position" />
          </div>
        )}
      </div>
    </div>
  );
}
