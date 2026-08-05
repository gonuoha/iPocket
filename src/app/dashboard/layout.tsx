import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { getDashboardLayoutData } from "@/lib/db/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarData, user } = await getDashboardLayoutData();

  return (
    <DashboardShell sidebar={<SidebarContent sidebarData={sidebarData} />} isPro={user.isPro}>
      {children}
    </DashboardShell>
  );
}
