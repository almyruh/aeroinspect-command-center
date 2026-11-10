import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { DemoBanner } from "@/components/demo-notice";
import { InspectionWorkspace } from "@/components/inspection/inspection-workspace";

export const Route = createFileRoute("/inspections/new")({
  head: () => ({
    meta: [
      { title: "New Inspection · AeroInspect AI" },
      { name: "description", content: "Upload an aerospace component image and review flagged surface defects." },
      { property: "og:title", content: "New Inspection · AeroInspect AI" },
      { property: "og:description", content: "Upload an aerospace component image and review flagged surface defects." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewInspection,
});

const STEPS = ["Image intake", "Pre-processing", "Defect screening", "Disposition"];

function NewInspection() {
  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        eyebrow="Inspection workflow"
        title="New Inspection"
        description="Load a component image to screen for cracks, corrosion, dents and scratches."
      />
      <DemoBanner />
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
      <InspectionWorkspace initialSample={null} />
    </div>
  );
}
