import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/page-header";
import { DemoBadge } from "@/components/demo-notice";
import { HistoryTable } from "@/components/history-table";
import { INSPECTION_HISTORY, type InspectionStatus } from "@/lib/inspection-data";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Inspection History · AeroInspect AI" },
      { name: "description", content: "Searchable log of completed aerospace component inspections." },
      { property: "og:title", content: "Inspection History · AeroInspect AI" },
      { property: "og:description", content: "Searchable log of completed aerospace component inspections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | InspectionStatus>("all");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return INSPECTION_HISTORY.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (!term) return true;
      return [r.id, r.component, r.partNumber, r.serial, r.aircraft, r.inspector].some((v) =>
        v.toLowerCase().includes(term),
      );
    });
  }, [q, status]);

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader
        eyebrow="Records"
        title="Inspection History"
        description="All recorded inspections with findings and disposition status."
        actions={
          <Button variant="panel" disabled title="Export not available in prototype">
            <Download /> Export CSV
          </Button>
        }
      />
      <section className="panel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
          <div className="flex items-center gap-3">
            <Tabs value={status} onValueChange={(v) => setStatus(v as typeof status)}>
              <TabsList className="bg-surface">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pass">Pass</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
                <TabsTrigger value="fail">Fail</TabsTrigger>
              </TabsList>
            </Tabs>
            <DemoBadge />
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter by ID, part, serial, inspector…"
              className="h-9 w-72 bg-surface pl-8 text-sm"
            />
          </div>
        </div>
        {rows.length ? (
          <HistoryTable rows={rows} />
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">No inspections match these filters.</p>
        )}
        <div className="border-t border-border px-5 py-2.5 font-mono text-[11px] text-muted-foreground">
          Showing {rows.length} of {INSPECTION_HISTORY.length} sample records
        </div>
      </section>
    </div>
  );
}
