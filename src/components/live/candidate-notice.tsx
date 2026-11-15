import { TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function CandidateNotice({ warning, className }: { warning?: string | null; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border border-warning/35 bg-warning/5 px-4 py-3 text-sm", className)}>
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
      <div className="space-y-1 text-muted-foreground">
        <p>
          <span className="font-semibold text-warning">Candidate defects only.</span> Highlighted regions come from
          automated edge detection. They are not validated aerospace defects and must be reviewed by a qualified
          inspector before any airworthiness decision.
        </p>
        {warning && (
          <p className="font-mono text-xs text-foreground/80">
            <span className="text-warning">Service warning:</span> {warning}
          </p>
        )}
      </div>
    </div>
  );
}
