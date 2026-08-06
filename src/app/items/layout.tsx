import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { getDashboardLayoutData } from "@/lib/db/dashboard";

export const dynamic = "force-dynamic";

export default async function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarData, user, collections } = await getDashboardLayoutData();

  return (
    <DashboardShell
      sidebar={<SidebarContent sidebarData={sidebarData} />}
      isPro={user.isPro}
      collections={collections}
    >
      {children}
    </DashboardShell>
  );
}
