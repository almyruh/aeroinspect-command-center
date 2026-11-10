import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { DemoBadge } from "@/components/demo-notice";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-5 w-px bg-border" />
      <div className="hidden items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground md:flex">
        <span>MRO Line B</span>
        <span className="text-border-strong">/</span>
        <span>Hangar 3</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <div className="relative hidden lg:block">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search part no., serial, tail…"
            className="h-8 w-64 border-border bg-surface pl-8 text-xs"
          />
        </div>
        <DemoBadge label="Demo mode" />
        <button
          type="button"
          aria-label="Notifications"
          className="relative grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </button>
        <div className="flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-full border border-border-strong bg-surface-raised font-mono text-[11px] font-semibold text-primary">
            RO
          </div>
          <div className="hidden leading-tight xl:block">
            <p className="text-xs font-medium">R. Okafor</p>
            <p className="text-[10px] text-muted-foreground">Lead NDT Inspector</p>
          </div>
        </div>
      </div>
    </header>
  );
}
