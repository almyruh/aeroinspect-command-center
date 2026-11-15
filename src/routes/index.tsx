import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { DemoBadge, DemoBanner } from "@/components/demo-notice";
import { StatCards } from "@/components/stat-cards";
import { LiveInspection } from "@/components/live/live-inspection";
import { LiveHistory } from "@/components/live/live-history";
import { ServiceStatus } from "@/components/live/service-status";
import { HistoryTable } from "@/components/history-table";
import { INSPECTION_HISTORY } from "@/lib/inspection-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · AeroInspect AI" },
      { name: "description", content: "Upload aerospace component images, run edge-detection inspection and review candidate defect regions." },
      { property: "og:title", content: "Dashboard · AeroInspect AI" },
      { property: "og:description", content: "Upload aerospace component images, run edge-detection inspection and review candidate defect regions." },
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
        eyebrow="Operations overview"
        title="Inspection Dashboard"
        description="Screen turbine, airframe and landing gear images for candidate surface defects."
        actions={
          <Button variant="signal" asChild>
            <Link to="/inspections/new">
              <ScanSearch /> New inspection
            </Link>
          </Button>
        }
      />
      <ServiceStatus />
      <LiveInspection />
      <LiveHistory limit={5} />

      <div className="mt-4 flex items-center gap-3">
        <h2 className="font-display text-xl font-semibold">Fleet overview</h2>
        <DemoBadge label="Sample data" />
      </div>
      <DemoBanner />
      <StatCards />
      <section className="panel">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-semibold">Sample inspection records</h2>
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
