"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import type { SidebarData } from "@/lib/db/sidebar";
import { cn } from "@/lib/utils";

import { TopBar } from "./top-bar";
import { SidebarContent } from "./sidebar-content";
import { SidebarProvider, useSidebar } from "./sidebar-context";

function DashboardShellInner({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
}) {
  const { collapsed, mobileOpen, setMobileOpen } = useSidebar();

  return (
    <div className="flex h-svh flex-col overflow-hidden">
      <TopBar />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside
          className={cn(
            "hidden h-full min-h-0 shrink-0 flex-col border-r border-border md:flex",
            collapsed ? "w-16" : "w-64"
          )}
        >
          <SidebarContent collapsed={collapsed} sidebarData={sidebarData} />
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="flex h-svh w-[min(18rem,85vw)] max-w-none flex-col gap-0 border-r p-0 sm:max-w-none"
          >
            <SidebarContent
              collapsed={false}
              sidebarData={sidebarData}
              onNavigate={() => setMobileOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto p-4 md:px-10 md:py-6 lg:px-24">
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  sidebarData,
}: {
  children: React.ReactNode;
  sidebarData: SidebarData;
}) {
  return (
    <SidebarProvider>
      <DashboardShellInner sidebarData={sidebarData}>{children}</DashboardShellInner>
    </SidebarProvider>
  );
}
