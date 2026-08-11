import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SidebarContent } from "@/components/dashboard/sidebar-content";
import { getDashboardLayoutData } from "@/lib/db/dashboard";

export const dynamic = "force-dynamic";

export default async function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sidebarData, user, collections, searchData, editorPreferences, userPreferences, usage } =
    await getDashboardLayoutData();

  return (
    <DashboardShell
      sidebar={<SidebarContent sidebarData={sidebarData} />}
      isPro={user.isPro}
      collections={collections}
      searchData={searchData}
      editorPreferences={editorPreferences}
      userPreferences={userPreferences}
      itemCount={usage.itemCount}
      collectionCount={usage.collectionCount}
    >
      {children}
    </DashboardShell>
  );
}
