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

export function makeInspectionId(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `LIVE-${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}-${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}`;
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
