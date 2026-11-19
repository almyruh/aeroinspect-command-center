import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertOctagon, Download, FileImage, Loader2, ScanSearch, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/inspection/upload-zone";
import { useApiBaseUrl } from "@/hooks/use-api-base-url";
import { ACCEPTED_LABEL, ACCEPTED_TYPES, InspectError, inspectImage, type InspectResult } from "@/lib/inspect-api";
import { createLoggedInspection, logInspection, type LoggedInspection } from "@/lib/inspection-log";
import { downloadCsv, inspectionsToCsv, reportFilename } from "@/lib/csv-report";
import { CandidateNotice } from "./candidate-notice";
import { ImageCompare } from "./image-compare";
import { MetricGrid } from "./metric-grid";

type Phase = "idle" | "ready" | "inspecting" | "done" | "error";

function formatBytes(n: number) {
  return n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function LiveInspection() {
  const baseUrl = useApiBaseUrl();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<{ message: string; kind: string } | null>(null);
  const [result, setResult] = useState<InspectResult | null>(null);
  const [entry, setEntry] = useState<LoggedInspection | null>(null);
  const abort = useRef<AbortController | null>(null);

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const onFile = useCallback((f: File) => {
    abort.current?.abort();
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setEntry(null);
    setError(null);
    setPhase("ready");
  }, []);

  const reset = () => {
    abort.current?.abort();
    setFile(null);
    setPreview(null);
    setResult(null);
    setEntry(null);
    setError(null);
    setPhase("idle");
  };

  const run = async () => {
    if (!file) return;
    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setPhase("inspecting");
    setError(null);
    setResult(null);
    setEntry(null);
    try {
      const r = await inspectImage(file, { baseUrl, signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      const e = createLoggedInspection(r, file, baseUrl);
      setResult(r);
      setEntry(e);
      setPhase("done");
      try {
        logInspection(e);
      } catch {
        toast.error("Inspection completed, but browser history could not be saved. Download the CSV report to keep this result.");
      }
      toast.success(`Inspection complete · ${r.totalRegions ?? "?"} candidate region${r.totalRegions === 1 ? "" : "s"}`);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Unexpected error during inspection.";
      setError({ message, kind: err instanceof InspectError ? err.kind : "unknown" });
      setPhase("error");
    }
  };

  const inspecting = phase === "inspecting";

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Intake */}
        <div className="panel flex flex-col gap-4 p-4 xl:col-span-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Image intake</p>
              <h2 className="font-display text-lg font-semibold">Upload component image</h2>
            </div>
            {file && !inspecting && (
              <Button variant="ghost" size="sm" onClick={reset}>
                <X /> Clear
              </Button>
            )}
          </div>

          <UploadZone onFile={onFile} compact={!!file} accept={ACCEPTED_TYPES} acceptLabel={ACCEPTED_LABEL} disabled={inspecting} />

          {file && preview && (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-md border border-border bg-background sm:w-40">
                <img src={preview} alt="Selected component" className="size-full object-cover" />
                {inspecting && <div className="absolute inset-x-0 h-0.5 animate-scan-y bg-primary shadow-glow" />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <FileImage className="size-4 shrink-0 text-primary" />
                  <p className="truncate text-sm font-medium">{file.name}</p>
                </div>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {file.type.replace("image/", "").toUpperCase()} · {formatBytes(file.size)}
                </p>
                <Button variant="signal" className="mt-3 w-full sm:w-auto" onClick={run} disabled={inspecting || !baseUrl}>
                  {inspecting ? <Loader2 className="animate-spin" /> : <ScanSearch />}
                  {inspecting ? "Inspecting…" : phase === "done" ? "Inspect again" : "Inspect Component"}
                </Button>
                {!baseUrl && (
                  <p className="mt-2 text-xs text-destructive">
                    No inspection service set.{" "}
                    <Link to="/settings" className="underline underline-offset-2">
                      Add it in Settings
                    </Link>
                    .
                  </p>
                )}
              </div>
            </div>
          )}

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/8 p-3 text-sm">
              <AlertOctagon className="mt-0.5 size-4 shrink-0 text-destructive" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-destructive">Inspection could not be completed</p>
                <p className="mt-0.5 break-words text-muted-foreground">{error.message}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="panel" onClick={run}>
                    Try again
                  </Button>
                  {error.kind === "config" || error.kind === "network" ? (
                    <Button size="sm" variant="ghost" asChild>
                      <Link to="/settings">Check service address</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metrics */}
        <div className="panel flex flex-col p-4 xl:col-span-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="eyebrow">Inspection metrics</p>
              <h2 className="font-display text-lg font-semibold">Results</h2>
            </div>
            {entry && (
              <Button variant="panel" size="sm" onClick={() => downloadCsv(inspectionsToCsv([entry]), reportFilename(entry))}>
                <Download /> CSV report
              </Button>
            )}
          </div>
          {inspecting ? (
            <div className="flex flex-1 flex-col gap-3" aria-busy="true">
              <div className="h-20 animate-pulse rounded-lg bg-muted" />
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
              <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" /> Sending image to the inspection service…
              </p>
            </div>
          ) : result ? (
            <>
              <MetricGrid result={entry ?? result} />
              {entry && <p className="mt-3 font-mono text-[11px] text-muted-foreground">{entry.id} · {result.filename}</p>}
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border-strong p-6 text-center">
              <ScanSearch className="size-6 text-muted-foreground" />
              <p className="font-display font-semibold">Awaiting inspection</p>
              <p className="max-w-xs text-xs text-muted-foreground">
                Upload a {ACCEPTED_LABEL} image and press Inspect Component. Metrics appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      {result && preview && (
        <>
          <CandidateNotice warning={result.warning} />
          <ImageCompare original={preview} annotated={result.annotatedImage} />
        </>
      )}
    </div>
  );
}
