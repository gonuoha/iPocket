import { CollectionsGrid } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { getDashboardPageData } from "@/lib/db/dashboard";

export default async function DashboardPage() {
  const { collections, stats, pinnedItems, recentItems } =
    await getDashboardPageData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your developer knowledge hub
        </p>
      </div>

      <StatsCards {...stats} />

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Collections</h2>
          <span className="text-sm text-muted-foreground">View all</span>
        </div>
        <CollectionsGrid collections={collections} />
      </section>

      {pinnedItems.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Pinned</h2>
          <div className="space-y-3">
            {pinnedItems.map((item) => (
              <ItemRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Recent Items</h2>
        <div className="space-y-3">
          {recentItems.map((item) => (
            <ItemRow key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
