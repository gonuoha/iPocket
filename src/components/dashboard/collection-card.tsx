import Link from "next/link";

import type { DashboardCollection } from "@/lib/db/collections";
import { getItemTypeIcon, getItemTypeStyles } from "@/lib/item-type-styles";
import { cn } from "@/lib/utils";

import { CollectionCardMenu } from "./collection-card-menu";

type CollectionCardProps = {
  collection: DashboardCollection;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  return (
    <div
      className="relative rounded-xl border border-border border-l-4 bg-card transition-colors hover:bg-muted/40"
      style={
        collection.dominantTypeColor
          ? { borderLeftColor: collection.dominantTypeColor }
          : undefined
      }
    >
      <div className="absolute top-2 right-2 z-10">
        <CollectionCardMenu
          key={`${collection.id}-${collection.isFavorite}`}
          collection={collection}
        />
      </div>

      <Link href={`/collections/${collection.id}`} className="block p-4">
        <h3 className="pr-8 font-medium">{collection.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {collection.itemCount} items
        </p>
        {collection.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {collection.description}
          </p>
        ) : null}
        {collection.types.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {collection.types.map((type) => {
              const Icon = getItemTypeIcon(type.icon);
              const styles = getItemTypeStyles(type.color);

              return (
                <span
                  key={type.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs",
                    styles.textClassName,
                    styles.bgClassName,
                  )}
                  style={{ ...styles.textStyle, ...styles.bgStyle }}
                >
                  <Icon className="size-3" />
                  {type.name}
                </span>
              );
            })}
          </div>
        ) : null}
      </Link>
    </div>
  );
}

type CollectionsGridProps = {
  collections: DashboardCollection[];
};

export function CollectionsGrid({ collections: collectionList }: CollectionsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {collectionList.map((collection) => (
        <CollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
}
