import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DemoBadge, DemoBanner } from "@/components/demo-notice";
import { StatCards } from "@/components/stat-cards";
import { InspectionWorkspace } from "@/components/inspection/inspection-workspace";
import { HistoryTable } from "@/components/history-table";
import { INSPECTION_HISTORY } from "@/lib/inspection-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AeroInspect AI" },
      { name: "description", content: "Overview of aerospace component inspections, defect findings and pass/fail status." },
      { property: "og:title", content: "Dashboard · AeroInspect AI" },
      { property: "og:description", content: "Overview of aerospace component inspections, defect findings and pass/fail status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        eyebrow="Operations overview · Last 30 days"
        title="Inspection Dashboard"
        description="Surface defect screening for turbine, airframe and landing gear components."
        actions={
          <Button variant="signal" asChild>
            <Link to="/inspections/new">
              <ScanSearch /> New inspection
            </Link>
          </Button>
        }
      />
      <DemoBanner />
      <StatCards />
      <InspectionWorkspace initialSample={0} />

      <section className="panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold">Recent inspections</h2>
            <DemoBadge />
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/history">
              View all <ArrowRight />
            </Link>
          </Button>
        </div>
        <HistoryTable rows={INSPECTION_HISTORY.slice(0, 6)} />
      </section>
    </div>
  );
}
