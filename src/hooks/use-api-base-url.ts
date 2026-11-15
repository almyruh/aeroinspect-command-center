import { useSyncExternalStore } from "react";
import { getEnvBaseUrl, resolveBaseUrl } from "@/lib/inspect-api";

function subscribe(cb: () => void) {
  window.addEventListener("aeroinspect:api-url", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("aeroinspect:api-url", cb);
    window.removeEventListener("storage", cb);
  };
}

/** Effective inspection service URL (Settings override, else VITE_API_BASE_URL). */
export function useApiBaseUrl(): string {
  return useSyncExternalStore(subscribe, resolveBaseUrl, getEnvBaseUrl);
}
