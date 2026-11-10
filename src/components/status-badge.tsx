import { Badge } from "@/components/ui/badge";
import type { InspectionStatus } from "@/lib/inspection-data";

const MAP: Record<InspectionStatus, { label: string; variant: "success" | "warning" | "danger" }> = {
  pass: { label: "Pass", variant: "success" },
  review: { label: "Review", variant: "warning" },
  fail: { label: "Fail", variant: "danger" },
};

export function StatusBadge({ status }: { status: InspectionStatus }) {
  const m = MAP[status];
  return (
    <Badge variant={m.variant} className="gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em]">
      <span className="size-1.5 rounded-full bg-current" />
      {m.label}
    </Badge>
  );
}
