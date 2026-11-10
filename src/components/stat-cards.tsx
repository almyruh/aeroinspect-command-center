import { AlertTriangle, CheckCircle2, ScanLine, XCircle } from "lucide-react";
import { OVERVIEW_STATS } from "@/lib/inspection-data";

const cards = [
  { key: "totalInspections", label: "Total Inspections", icon: ScanLine, tone: "text-primary", bar: "bg-primary" },
  { key: "defectsDetected", label: "Defects Detected", icon: AlertTriangle, tone: "text-warning", bar: "bg-warning" },
  { key: "componentsPassed", label: "Components Passed", icon: CheckCircle2, tone: "text-success", bar: "bg-success" },
  { key: "componentsFailed", label: "Components Failed", icon: XCircle, tone: "text-destructive", bar: "bg-destructive" },
] as const;

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((c) => {
        const s = OVERVIEW_STATS[c.key];
        return (
          <div key={c.key} className="panel relative overflow-hidden p-5">
            <div className={`absolute inset-x-0 top-0 h-px ${c.bar} opacity-70`} />
            <div className="flex items-start justify-between">
              <p className="eyebrow">{c.label}</p>
              <c.icon className={`size-4 ${c.tone}`} />
            </div>
            <p className="mt-3 font-display text-4xl font-semibold tracking-tight">
              {s.value.toLocaleString("en-US")}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs">
              <span className={`font-mono font-medium ${c.tone}`}>{s.delta}</span>
              <span className="text-muted-foreground">{s.note}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
