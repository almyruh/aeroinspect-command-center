import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { DEFECT_META, DEFECT_TYPES, type DefectType } from "@/lib/inspection-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings · AeroInspect AI" },
      { name: "description", content: "Configure detection thresholds, notifications and station details." },
      { property: "og:title", content: "Settings · AeroInspect AI" },
      { property: "og:description", content: "Configure detection thresholds, notifications and station details." },
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
  const [thresholds, setThresholds] = useState<Record<DefectType, number>>({
    crack: 60,
    corrosion: 70,
    dent: 70,
    scratch: 75,
  });

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Preferences are kept in this session only — nothing is saved in the prototype."
        actions={
          <Button variant="signal" onClick={() => toast.success("Settings applied for this session (prototype — not saved)")}>
            Save changes
          </Button>
        }
      />

      <Section title="Detection model" sub="The vision model that screens uploaded images.">
        <div className="flex items-center justify-between rounded-md border border-warning/40 bg-warning/5 p-4">
          <div>
            <p className="font-medium">No model connected</p>
            <p className="text-xs text-muted-foreground">Running in demonstration mode with sample results.</p>
          </div>
          <Button variant="panel" size="sm" disabled>
            Connect model
          </Button>
        </div>
      </Section>

      <Section title="Confidence thresholds" sub="Minimum confidence required to flag a region, per defect category.">
        {DEFECT_TYPES.map((t) => (
          <div key={t}>
            <div className="mb-2 flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <span className={`size-2.5 rounded-[2px] ${DEFECT_META[t].bgClass}`} />
                {DEFECT_META[t].label}
              </Label>
              <span className="font-mono text-xs text-primary">{thresholds[t]}%</span>
            </div>
            <Slider
              value={[thresholds[t]]}
              min={30}
              max={99}
              step={1}
              onValueChange={([v]) => setThresholds((s) => ({ ...s, [t]: v }))}
            />
          </div>
        ))}
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
