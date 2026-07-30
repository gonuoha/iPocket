import { TopBar } from "@/components/dashboard/top-bar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        <aside className="hidden w-60 shrink-0 border-r border-border p-4 sm:block">
          <h2>Sidebar</h2>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
