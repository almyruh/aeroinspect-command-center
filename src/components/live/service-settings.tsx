import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiBaseUrl } from "@/hooks/use-api-base-url";
import { cleanBaseUrl, getEnvBaseUrl, getOverrideBaseUrl, isValidBaseUrl, setOverrideBaseUrl } from "@/lib/inspect-api";

type Check = { state: "idle" | "checking" | "ok" | "fail"; msg?: string };

export function ServiceSettings() {
  const effective = useApiBaseUrl();
  const [envUrl, setEnvUrl] = useState("");
  const [value, setValue] = useState("");
  const [check, setCheck] = useState<Check>({ state: "idle" });

  useEffect(() => {
    setEnvUrl(getEnvBaseUrl());
    setValue(getOverrideBaseUrl());
  }, []);

  const candidate = cleanBaseUrl(value) || envUrl;
  const invalid = !!cleanBaseUrl(value) && !isValidBaseUrl(cleanBaseUrl(value));

  const save = () => {
    if (invalid) return;
    setOverrideBaseUrl(value);
    setCheck({ state: "idle" });
    toast.success(cleanBaseUrl(value) ? "Inspection service address saved in this browser" : "Using the default address");
  };

  const test = async () => {
    if (!candidate || !isValidBaseUrl(candidate)) return;
    setCheck({ state: "checking" });
    try {
      const res = await fetch(`${candidate}/openapi.json`, { method: "GET" });
      setCheck(
        res.ok
          ? { state: "ok", msg: "Service reachable." }
          : { state: "ok", msg: `Service reachable (HTTP ${res.status} on /openapi.json).` },
      );
    } catch {
      setCheck({ state: "fail", msg: "Not reachable from this browser. Check the address, that it is online, and that CORS allows this site." });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="api-url">Service address</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="api-url"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setCheck({ state: "idle" });
            }}
            placeholder={envUrl || "https://your-inspection-service.example.com"}
            className="bg-surface font-mono text-sm"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
          />
          <Button variant="signal" onClick={save} disabled={invalid}>
            Save
          </Button>
          <Button variant="panel" onClick={test} disabled={!candidate || invalid || check.state === "checking"}>
            {check.state === "checking" && <Loader2 className="animate-spin" />}
            Test connection
          </Button>
        </div>
        {invalid && <p className="text-xs text-destructive">Enter a full address starting with http:// or https://</p>}
        <p className="text-xs text-muted-foreground">
          Images are sent to <span className="font-mono">{candidate ? `${candidate}/inspect` : "…/inspect"}</span>. Leave empty to use
          the default from <span className="font-mono">VITE_API_BASE_URL</span>
          {envUrl ? (
            <>
              {" "}(<span className="font-mono">{envUrl}</span>)
            </>
          ) : (
            " (not set)"
          )}
          .
        </p>
      </div>

      {check.state === "ok" && (
        <p className="flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="size-4" /> {check.msg}
        </p>
      )}
      {check.state === "fail" && (
        <p className="flex items-start gap-2 text-sm text-destructive">
          <XCircle className="mt-0.5 size-4 shrink-0" /> {check.msg}
        </p>
      )}

      <div className="rounded-md border border-border bg-surface p-3 text-xs text-muted-foreground">
        <p>
          Currently active: <span className="font-mono text-foreground">{effective || "none"}</span>
        </p>
        <p className="mt-1">
          The service runs OpenCV edge detection and returns candidate regions. It does not produce confidence or accuracy
          scores, and none are shown in this app.
        </p>
      </div>
    </div>
  );
}
