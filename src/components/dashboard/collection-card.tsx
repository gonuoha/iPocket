import Link from "next/link";
import { Star } from "lucide-react";

import {
  itemTypeBgColors,
  itemTypeColors,
  itemTypeIcons,
} from "@/lib/item-type-styles";
import {
  itemTypes,
  items,
  type Collection,
  type ItemType,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const borderColors = [
  "border-l-blue-500",
  "border-l-yellow-500",
  "border-l-purple-500",
  "border-l-orange-500",
  "border-l-cyan-500",
  "border-l-pink-500",
];

function getCollectionTypes(collectionId: string) {
  const typeIds = [
    ...new Set(
      items
        .filter((item) => item.collectionId === collectionId)
        .map((item) => item.typeId)
    ),
  ];

  return typeIds
    .map((typeId) => itemTypes.find((type) => type.id === typeId))
    .filter((type): type is ItemType => Boolean(type));
}

type CollectionCardProps = {
  collection: Collection;
  colorIndex: number;
};

export function CollectionCard({ collection, colorIndex }: CollectionCardProps) {
  const types = getCollectionTypes(collection.id);

  return (
    <Link
      href={`/collections/${collection.id}`}
      className={cn(
        "block rounded-xl border border-border border-l-4 bg-card p-4 transition-colors hover:bg-muted/40",
        borderColors[colorIndex % borderColors.length]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{collection.name}</h3>
        {collection.isFavorite ? (
          <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
        ) : null}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {collection.itemCount} items
      </p>
      {collection.description ? (
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {collection.description}
        </p>
      ) : null}
      {types.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {types.map((type) => {
            const Icon = itemTypeIcons[type.icon];
            return (
              <span
                key={type.id}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs",
                  itemTypeBgColors[type.color],
                  itemTypeColors[type.color]
                )}
              >
                <Icon className="size-3" />
                {type.name.replace(/s$/, "")}
              </span>
            );
          })}
        </div>
      ) : null}
    </Link>
  );
}

type CollectionsGridProps = {
  collections: Collection[];
};

export function CollectionsGrid({ collections: collectionList }: CollectionsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {collectionList.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          colorIndex={index}
        />
      ))}
    </div>
  );
}
