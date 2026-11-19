/**
 * Recent live inspections, kept in this browser only (metadata, no images).
 */
import { useSyncExternalStore } from "react";
import type { InspectResult } from "./inspect-api";

export interface LoggedInspection extends Omit<InspectResult, "annotatedImage"> {
  id: string;
  inspectedAt: string; // ISO
  fileSizeBytes: number;
  serviceUrl: string;
}

const KEY = "aeroinspect.liveHistory.v1";
const MAX = 50;
const EVT = "aeroinspect:history";
const EMPTY: LoggedInspection[] = [];
let cache: { raw: string | null; list: LoggedInspection[] } = { raw: null, list: EMPTY };

function read(): LoggedInspection[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw === cache.raw) return cache.list;
  let list: LoggedInspection[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    list = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    list = EMPTY;
  }
  cache = { raw, list };
  return list;
}

function write(list: LoggedInspection[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
  window.dispatchEvent(new Event(EVT));
}

export function makeInspectionId(): string {
  // Timestamps alone collide when separate inspections finish in the same second.
  return `LIVE-${crypto.randomUUID()}`;
}

/** One immutable metadata snapshot shared by the live view, history and CSV. */
export function createLoggedInspection(
  result: InspectResult,
  file: Pick<File, "size">,
  serviceUrl: string,
  inspectedAt: Date = new Date(),
): LoggedInspection {
  return {
    id: makeInspectionId(),
    inspectedAt: inspectedAt.toISOString(),
    fileSizeBytes: file.size,
    serviceUrl,
    filename: result.filename,
    width: result.width,
    height: result.height,
    totalRegions: result.totalRegions,
    meanBrightness: result.meanBrightness,
    edgePixelRatio: result.edgePixelRatio,
    status: result.status,
    warning: result.warning,
  };
}

export function logInspection(entry: LoggedInspection) {
  write([entry, ...read().filter((e) => e.id !== entry.id)]);
}

export function clearInspectionLog() {
  write([]);
}

function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useInspectionLog(): LoggedInspection[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
