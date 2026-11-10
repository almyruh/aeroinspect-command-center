import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { DemoBadge, DemoBanner } from "@/components/demo-notice";
import {
  DEFECTS_BY_COMPONENT,
  DEFECT_DISTRIBUTION,
  DEFECT_META,
  DEFECT_TYPES,
  WEEKLY_TREND,
} from "@/lib/inspection-data";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports · AeroInspect AI" },
      { name: "description", content: "Inspection throughput, defect distribution and pass-rate trends." },
      { property: "og:title", content: "Reports · AeroInspect AI" },
      { property: "og:description", content: "Inspection throughput, defect distribution and pass-rate trends." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReportsPage,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, fontFamily: "var(--font-mono)" };
const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border-strong)",
  borderRadius: 6,
  fontSize: 12,
  color: "var(--foreground)",
};

function Panel({ title, sub, children, className = "" }: { title: string; sub: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`panel p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{sub}</p>
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        <DemoBadge />
      </div>
      {children}
    </section>
  );
}

function ReportsPage() {
  const total = DEFECT_DISTRIBUTION.reduce((a, d) => a + d.count, 0);
  const totals = WEEKLY_TREND.reduce(
    (a, w) => ({ pass: a.pass + w.pass, review: a.review + w.review, fail: a.fail + w.fail }),
    { pass: 0, review: 0, fail: 0 },
  );
  const all = totals.pass + totals.review + totals.fail;

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
      <PageHeader eyebrow="Analytics · Weeks 38–43" title="Reports" description="Quality trends across the inspected fleet." />
      <DemoBanner />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["First-pass yield", `${((totals.pass / all) * 100).toFixed(1)}%`, "text-success"],
          ["Review rate", `${((totals.review / all) * 100).toFixed(1)}%`, "text-warning"],
          ["Rejection rate", `${((totals.fail / all) * 100).toFixed(1)}%`, "text-destructive"],
          ["Mean screening time", "4.3 s", "text-primary"],
        ].map(([k, v, tone]) => (
          <div key={k} className="panel p-4">
            <p className="eyebrow">{k}</p>
            <p className={`mt-2 font-display text-3xl font-semibold ${tone}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <Panel title="Weekly inspection outcomes" sub="Throughput" className="xl:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_TREND} barSize={28}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="week" tick={axis} axisLine={false} tickLine={false} />
                <YAxis tick={axis} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
                <Bar dataKey="pass" stackId="a" fill="var(--success)" name="Pass" />
                <Bar dataKey="review" stackId="a" fill="var(--warning)" name="Review" />
                <Bar dataKey="fail" stackId="a" fill="var(--destructive)" name="Fail" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Defect distribution" sub="By category">
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={DEFECT_DISTRIBUTION} dataKey="count" nameKey="type" innerRadius={58} outerRadius={84} paddingAngle={2} stroke="none">
                  {DEFECT_DISTRIBUTION.map((d) => (
                    <Cell key={d.type} fill={DEFECT_META[d.type].colorVar} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="font-display text-3xl font-semibold">{total}</p>
                <p className="eyebrow">defects</p>
              </div>
            </div>
          </div>
          <ul className="mt-4 space-y-2">
            {DEFECT_DISTRIBUTION.map((d) => (
              <li key={d.type} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className={`size-2.5 rounded-[2px] ${DEFECT_META[d.type].bgClass}`} />
                  {DEFECT_META[d.type].label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {d.count} · {((d.count / total) * 100).toFixed(0)}%
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Defects by component group" sub="Findings">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEFECTS_BY_COMPONENT} layout="vertical" barSize={16}>
              <CartesianGrid stroke="var(--border)" horizontal={false} />
              <XAxis type="number" tick={axis} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="group" tick={axis} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              {DEFECT_TYPES.map((t, i) => (
                <Bar
                  key={t}
                  dataKey={t}
                  stackId="d"
                  name={DEFECT_META[t].label}
                  fill={DEFECT_META[t].colorVar}
                  radius={i === DEFECT_TYPES.length - 1 ? [0, 3, 3, 0] : undefined}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}
