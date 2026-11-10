import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UploadZone } from "./upload-zone";
import { DefectViewer } from "./defect-viewer";
import { ResultsPanel } from "./results-panel";
import {
  DEMO_UPLOAD_DEFECTS,
  SAMPLE_INSPECTIONS,
  deriveStatus,
  type Defect,
} from "@/lib/inspection-data";

interface Current {
  image: string;
  defects: Defect[];
  uploaded: boolean;
  meta: { id: string; component: string; partNumber: string; serial: string; durationSec: number };
}

function fromSample(i: number): Current {
  const s = SAMPLE_INSPECTIONS[i];
  return {
    image: s.image!,
    defects: s.defects,
    uploaded: false,
    meta: { id: s.id, component: s.component, partNumber: s.partNumber, serial: s.serial, durationSec: s.durationSec },
  };
}

export function InspectionWorkspace({ initialSample = 0 }: { initialSample?: number | null }) {
  const [current, setCurrent] = useState<Current | null>(initialSample === null ? null : fromSample(initialSample));
  const [sampleIdx, setSampleIdx] = useState<number | null>(initialSample);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [overlay, setOverlay] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrl = useRef<string | null>(null);

  const runDemo = useCallback((next: Current) => {
    if (timer.current) clearInterval(timer.current);
    setCurrent(next);
    setAnalyzing(true);
    setProgress(0);
    const start = Date.now();
    timer.current = setInterval(() => {
      const p = Math.min(100, ((Date.now() - start) / 2200) * 100);
      setProgress(p);
      if (p >= 100) {
        if (timer.current) clearInterval(timer.current);
        setAnalyzing(false);
      }
    }, 60);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearInterval(timer.current);
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    },
    [],
  );

  const onFile = useCallback(
    (file: File) => {
      if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
      const url = URL.createObjectURL(file);
      objectUrl.current = url;
      setSampleIdx(null);
      runDemo({
        image: url,
        defects: DEMO_UPLOAD_DEFECTS,
        uploaded: true,
        meta: {
          id: "INS-2611-DEMO",
          component: file.name,
          partNumber: "Not specified",
          serial: "Not specified",
          durationSec: 2.2,
        },
      });
    },
    [runDemo],
  );

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
      <div className="flex flex-col gap-5 xl:col-span-8">
        <div className="panel p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Image intake</p>
              <h2 className="font-display text-lg font-semibold">Upload component image</h2>
            </div>
            {current?.uploaded && (
              <Button variant="ghost" size="sm" onClick={() => current && runDemo(current)}>
                <RotateCcw /> Re-run demo
              </Button>
            )}
          </div>
          <UploadZone onFile={onFile} compact={!!current} />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="eyebrow mr-1">Demo samples</span>
            {SAMPLE_INSPECTIONS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSampleIdx(i);
                  runDemo(fromSample(i));
                }}
                className={cn(
                  "flex items-center gap-2 rounded-md border px-2 py-1 text-xs transition-colors",
                  sampleIdx === i
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border bg-surface text-muted-foreground hover:border-border-strong hover:text-foreground",
                )}
              >
                <img src={s.image} alt="" width={32} height={22} className="h-5 w-7 rounded-sm object-cover" loading="lazy" />
                {s.component.split(",")[0]}
              </button>
            ))}
          </div>
        </div>

        {current ? (
          <DefectViewer
            image={current.image}
            defects={current.defects}
            analyzing={analyzing}
            progress={progress}
            showOverlay={overlay}
            onToggleOverlay={setOverlay}
            activeId={activeId}
            onHover={setActiveId}
            caption={`${current.meta.component} · ${current.meta.serial}`}
          />
        ) : (
          <div className="panel grid aspect-[10/7] place-items-center bg-blueprint text-sm text-muted-foreground">
            Image preview appears here after upload
          </div>
        )}
      </div>

      <div className="xl:col-span-4">
        {current ? (
          <ResultsPanel
            status={deriveStatus(current.defects)}
            defects={current.defects}
            analyzing={analyzing}
            meta={current.meta}
            activeId={activeId}
            onHover={setActiveId}
            uploaded={current.uploaded}
          />
        ) : (
          <div className="panel flex h-full min-h-80 flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="font-display text-lg font-semibold">Awaiting image</p>
            <p className="text-sm text-muted-foreground">
              Upload a component image or pick a demo sample to see the results layout.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
