import { CollectionsGrid } from "@/components/dashboard/collection-card";
import { ItemRow } from "@/components/dashboard/item-row";
import { StatsCards } from "@/components/dashboard/stats-cards";
import {
  getDashboardStats,
  getRecentCollections,
} from "@/lib/db/collections";
import { getPinnedItems, getRecentItems } from "@/lib/db/items";
import { getDashboardUserId } from "@/lib/db/user";

export default async function DashboardPage() {
  const userId = await getDashboardUserId();
  const [collections, stats, pinnedItems, recentItems] = await Promise.all([
    getRecentCollections(userId),
    getDashboardStats(userId),
    getPinnedItems(userId),
    getRecentItems(userId),
  ]);

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
