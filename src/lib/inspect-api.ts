/**
 * Client for the external FastAPI inspection service (POST /inspect).
 * The service runs OpenCV edge detection and returns candidate regions only —
 * never validated defects, and never model confidence/accuracy figures.
 */

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ACCEPTED_LABEL = "JPG, PNG or WEBP";
const OVERRIDE_KEY = "aeroinspect.apiBaseUrl";
const TIMEOUT_MS = 60_000;

export interface InspectResult {
  filename: string;
  width: number | null;
  height: number | null;
  totalRegions: number | null;
  meanBrightness: number | null;
  edgePixelRatio: number | null;
  status: string;
  warning: string | null;
  /** Displayable data URL (image/jpeg) or null when the service sent none. */
  annotatedImage: string | null;
}

export class InspectError extends Error {
  constructor(
    message: string,
    public kind: "config" | "network" | "http" | "parse" | "timeout" | "file",
  ) {
    super(message);
  }
}

/* ---------- Base URL ---------- */

export function cleanBaseUrl(url: string | undefined | null): string {
  return (url ?? "").trim().replace(/\/+$/, "");
}

export function getEnvBaseUrl(): string {
  return cleanBaseUrl(import.meta.env.VITE_API_BASE_URL as string | undefined);
}

export function getOverrideBaseUrl(): string {
  if (typeof window === "undefined") return "";
  try {
    return cleanBaseUrl(window.localStorage.getItem(OVERRIDE_KEY));
  } catch {
    return "";
  }
}

export function setOverrideBaseUrl(url: string) {
  const v = cleanBaseUrl(url);
  if (v) window.localStorage.setItem(OVERRIDE_KEY, v);
  else window.localStorage.removeItem(OVERRIDE_KEY);
  window.dispatchEvent(new Event("aeroinspect:api-url"));
}

/** Browser override (Settings) wins over the build-time VITE_API_BASE_URL. */
export function resolveBaseUrl(): string {
  return getOverrideBaseUrl() || getEnvBaseUrl();
}

export function isValidBaseUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function inspectEndpoint(base: string): string {
  return `${cleanBaseUrl(base)}/inspect`;
}

/* ---------- Response parsing ---------- */

type Obj = Record<string, unknown>;

function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v))) return Number(v);
  return null;
}

function pick(o: Obj, keys: string[]): unknown {
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
}

function dims(o: Obj): { width: number | null; height: number | null } {
  let width = num(pick(o, ["width", "image_width", "img_width"]));
  let height = num(pick(o, ["height", "image_height", "img_height"]));
  const d = pick(o, ["image_dimensions", "dimensions", "image_size", "size", "shape"]);
  if (d && (width === null || height === null)) {
    if (Array.isArray(d)) {
      // OpenCV shape is [height, width, channels]
      const key = pick(o, ["shape"]) === d;
      const [a, b] = d.map(num);
      if (key) [height, width] = [a ?? null, b ?? null];
      else [width, height] = [a ?? null, b ?? null];
    } else if (typeof d === "object") {
      width ??= num((d as Obj)["width"] ?? (d as Obj)["w"]);
      height ??= num((d as Obj)["height"] ?? (d as Obj)["h"]);
    } else if (typeof d === "string") {
      const m = d.match(/(\d+)\s*[x×,]\s*(\d+)/i);
      if (m) [width, height] = [Number(m[1]), Number(m[2])];
    }
  }
  return { width, height };
}

/** Accepts raw base64 or an existing data URL and returns a displayable JPEG data URL. */
export function toJpegDataUrl(b64: unknown): string | null {
  if (typeof b64 !== "string") return null;
  const s = b64.trim();
  if (!s) return null;
  if (s.startsWith("data:image/")) return s;
  return `data:image/jpeg;base64,${s.replace(/\s+/g, "")}`;
}

export function normalizeInspectResponse(raw: unknown, fallbackName: string): InspectResult {
  if (!raw || typeof raw !== "object") throw new InspectError("The inspection service returned an unexpected response.", "parse");
  const o = raw as Obj;
  const regionsVal = pick(o, [
    "total_detected_regions",
    "total_regions",
    "total_candidate_regions",
    "detected_regions",
    "regions_detected",
    "num_regions",
    "region_count",
    "regions",
  ]);
  const totalRegions = Array.isArray(regionsVal) ? regionsVal.length : num(regionsVal);
  const { width, height } = dims(o);
  const status = pick(o, ["inspection_status", "status", "result"]);
  const warning = pick(o, ["warning", "disclaimer", "note"]);
  return {
    filename: String(pick(o, ["filename", "file_name", "name"]) ?? fallbackName),
    width,
    height,
    totalRegions,
    meanBrightness: num(pick(o, ["mean_brightness", "brightness", "avg_brightness"])),
    edgePixelRatio: num(pick(o, ["edge_pixel_ratio", "edge_ratio", "edge_density"])),
    status: typeof status === "string" && status.trim() ? status.trim() : "Unknown",
    warning: typeof warning === "string" && warning.trim() ? warning.trim() : null,
    annotatedImage: toJpegDataUrl(pick(o, ["annotated_image", "annotated_image_base64", "annotated", "image_base64"])),
  };
}

/* ---------- Request ---------- */

function detailFrom(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const d = (body as Obj)["detail"] ?? (body as Obj)["message"] ?? (body as Obj)["error"];
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((x) => (x && typeof x === "object" ? String((x as Obj)["msg"] ?? "") : String(x))).filter(Boolean).join("; ") || null;
  return null;
}

export function validateFile(file: File): string | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return `Unsupported file type. Use ${ACCEPTED_LABEL}.`;
  if (file.size > 25 * 1024 * 1024) return "File exceeds the 25 MB limit.";
  return null;
}

export async function inspectImage(file: File, opts: { baseUrl?: string; signal?: AbortSignal } = {}): Promise<InspectResult> {
  const base = cleanBaseUrl(opts.baseUrl ?? resolveBaseUrl());
  if (!base) throw new InspectError("No inspection service address is set. Add it in Settings or set VITE_API_BASE_URL.", "config");
  if (!isValidBaseUrl(base)) throw new InspectError(`"${base}" is not a valid web address.`, "config");
  const fileErr = validateFile(file);
  if (fileErr) throw new InspectError(fileErr, "file");

  const form = new FormData();
  form.append("file", file, file.name);

  const ctrl = new AbortController();
  const onAbort = () => ctrl.abort();
  opts.signal?.addEventListener("abort", onAbort);
  let timedOut = false;
  const t = setTimeout(() => {
    timedOut = true;
    ctrl.abort();
  }, TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(inspectEndpoint(base), { method: "POST", body: form, signal: ctrl.signal });
  } catch (e) {
    if (timedOut) throw new InspectError("The inspection service took too long to respond (60 s).", "timeout");
    if ((e as Error).name === "AbortError") throw e;
    throw new InspectError(
      `Could not reach the inspection service at ${base}. Check that it is running, publicly reachable, and allows requests from this site (CORS).`,
      "network",
    );
  } finally {
    clearTimeout(t);
    opts.signal?.removeEventListener("abort", onAbort);
  }

  let body: unknown = null;
  const text = await res.text();
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const detail = detailFrom(body);
    throw new InspectError(`Inspection failed (HTTP ${res.status})${detail ? `: ${detail}` : "."}`, "http");
  }
  if (body === null) throw new InspectError("The inspection service did not return JSON.", "parse");
  return normalizeInspectResponse(body, file.name);
}

/* ---------- Formatting ---------- */

export function formatDims(r: Pick<InspectResult, "width" | "height">): string {
  return r.width !== null && r.height !== null ? `${r.width} × ${r.height} px` : "—";
}

export function formatRatio(v: number | null): string {
  if (v === null) return "—";
  return v <= 1 ? `${(v * 100).toFixed(2)}%` : v.toFixed(4);
}

export function formatBrightness(v: number | null): string {
  return v === null ? "—" : `${v.toFixed(1)} / 255`;
}

export type StatusTone = "success" | "warning" | "danger" | "neutral";

/** Visual tone only — the backend's status text is always shown verbatim. */
export function statusTone(status: string, regions: number | null): StatusTone {
  const s = status.toLowerCase();
  if (/(fail|reject|critical)/.test(s)) return "danger";
  if (/(review|candidate|detected|flag|attention|warn)/.test(s)) return "warning";
  if (/(pass|clear|ok|no (candidate|defect|region))/.test(s)) return "success";
  if (regions === 0) return "success";
  if (regions && regions > 0) return "warning";
  return "neutral";
}
