import { Link } from "@tanstack/react-router";
import { PlugZap, Unplug } from "lucide-react";
import { useHydrated } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useApiBaseUrl } from "@/hooks/use-api-base-url";

export function ServiceStatus() {
  const hydrated = useHydrated();
  const url = useApiBaseUrl();
  if (!hydrated) return <div className="h-[62px] rounded-lg border border-border bg-surface" aria-hidden />;

  if (!url) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/8 px-4 py-3">
        <Unplug className="size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1 text-sm">
          <p className="font-semibold text-destructive">Inspection service not connected</p>
          <p className="text-muted-foreground">
            Add the address of your inspection service in Settings to start inspecting images.
          </p>
        </div>
        <Button variant="panel" size="sm" asChild>
          <Link to="/settings">Open Settings</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
      <PlugZap className="size-4 shrink-0 text-primary" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold text-primary">Inspection service configured</p>
        <p className="truncate font-mono text-xs text-muted-foreground">POST {url}/inspect · OpenCV edge detection (demonstration system)</p>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link to="/settings">Change</Link>
      </Button>
    </div>
  );
}
