import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { LiveInspection } from "@/components/live/live-inspection";
import { LiveHistory } from "@/components/live/live-history";
import { ServiceStatus } from "@/components/live/service-status";

export const Route = createFileRoute("/inspections/new")({
  head: () => ({
    meta: [
      { title: "New Inspection · AeroInspect AI" },
      { name: "description", content: "Upload an aerospace component image, run edge-detection inspection and compare original and annotated views." },
      { property: "og:title", content: "New Inspection · AeroInspect AI" },
      { property: "og:description", content: "Upload an aerospace component image, run edge-detection inspection and compare original and annotated views." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewInspection,
});

const STEPS = ["Image intake", "Edge detection", "Candidate review", "CSV report"];

function NewInspection() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        eyebrow="Inspection workflow"
        title="New Inspection"
        description="Load a component image to flag candidate regions for cracks, corrosion, dents and scratches."
      />
      <ServiceStatus />
      <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s} className="panel flex items-center gap-3 px-4 py-3">
            <span className="grid size-7 place-items-center rounded-full border border-primary/50 font-mono text-xs text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-medium">{s}</span>
          </li>
        ))}
      </ol>
      <LiveInspection />
      <LiveHistory limit={5} />
    </div>
  );
}
