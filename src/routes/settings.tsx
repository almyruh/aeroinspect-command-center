import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { ServiceSettings } from "@/components/live/service-settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AeroInspect AI" },
      { name: "description", content: "Configure the inspection service address, station details and notifications." },
      { property: "og:title", content: "Settings · AeroInspect AI" },
      { property: "og:description", content: "Configure the inspection service address, station details and notifications." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

function Section({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section className="panel grid gap-6 p-6 lg:grid-cols-3">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{sub}</p>
      </div>
      <div className="space-y-5 lg:col-span-2">{children}</div>
    </section>
  );
}

function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="The service address is saved in this browser. Other preferences are kept for this session only."
        actions={
          <Button variant="signal" onClick={() => toast.success("Station and notification preferences applied for this session")}>
            Save changes
          </Button>
        }
      />

      <Section title="Inspection service" sub="Address of the image inspection service that receives uploads.">
        <ServiceSettings />
      </Section>

      <Section title="Station" sub="Shown on inspection records and reports.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="org">Organisation</Label>
            <Input id="org" defaultValue="Northline Aero Technics" className="bg-surface" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="station">Station</Label>
            <Input id="station" defaultValue="Hangar 3 · MRO Line B" className="bg-surface" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="approval">Part-145 approval ref.</Label>
            <Input id="approval" defaultValue="EASA.145.0000 (sample)" className="bg-surface font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="srm">Default SRM revision</Label>
            <Input id="srm" defaultValue="Rev. 84 (sample)" className="bg-surface font-mono" />
          </div>
        </div>
      </Section>

      <Section title="Notifications" sub="Alerts sent when inspections complete.">
        {[
          ["Critical findings", "Notify the duty engineer immediately on any Fail result.", true],
          ["Engineering review queue", "Daily digest of components awaiting disposition.", true],
          ["Weekly quality report", "Summary of yield and defect trends every Monday.", false],
        ].map(([title, body, on]) => (
          <div key={title as string} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-xs text-muted-foreground">{body}</p>
            </div>
            <Switch defaultChecked={on as boolean} />
          </div>
        ))}
      </Section>
    </div>
  );
}
