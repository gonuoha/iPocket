import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getSidebarData } from "@/lib/db/sidebar";
import { getDashboardUserId } from "@/lib/db/user";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getDashboardUserId();
  const sidebarData = await getSidebarData(userId);

  return (
    <DashboardShell sidebarData={sidebarData}>
      {children}
    </DashboardShell>
  );
}
