import { FlaskConical } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function DemoBadge({ label = "Demo data" }: { label?: string }) {
  return (
    <Badge variant="demo" className="gap-1">
      <FlaskConical className="size-3" />
      {label}
    </Badge>
  );
}

export function DemoBanner() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-warning" />
      <p className="text-muted-foreground">
        <span className="font-semibold text-warning">Prototype — demonstration data only.</span>{" "}
        No AI defect-detection model is connected yet. All defects, bounding boxes, confidence
        scores and statistics shown are sample values for interface evaluation.
      </p>
    </div>
  );
}
