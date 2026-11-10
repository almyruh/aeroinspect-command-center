import { Link, useRouterState } from "@tanstack/react-router";
import { BarChart3, FileText, History, LayoutDashboard, ScanSearch, Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { AeroLogo } from "@/components/aero-logo";

const primary = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "New Inspection", url: "/inspections/new", icon: ScanSearch },
  { title: "Inspection History", url: "/history", icon: History },
  { title: "Reports", url: "/reports", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link to="/" className="flex items-center gap-2.5">
          <AeroLogo className="size-8 shrink-0" />
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-base font-semibold tracking-wide text-foreground">
                AeroInspect <span className="text-primary">AI</span>
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Visual NDT Console
              </p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.16em]">
            Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primary.map((item) => {
                const active = path === item.url;
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.title}
                      className="h-9 data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary data-[active=true]:shadow-[inset_2px_0_0_0_var(--primary)]"
                    >
                      <Link to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.16em]">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={path === "/settings"}
                  tooltip="Settings"
                  className="h-9 data-[active=true]:bg-sidebar-accent data-[active=true]:text-primary data-[active=true]:shadow-[inset_2px_0_0_0_var(--primary)]"
                >
                  <Link to="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed ? (
          <div className="rounded-md border border-sidebar-border bg-background/40 p-3">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-warning animate-blink" />
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-warning">
                Demo mode
              </p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Vision model not connected. Results use sample data.
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <FileText className="size-3" /> Build 0.1 · Prototype
            </div>
          </div>
        ) : (
          <span className="mx-auto size-2 rounded-full bg-warning animate-blink" />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
