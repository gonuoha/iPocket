import { FolderHeart, Heart, Layers, Star } from "lucide-react";

import { collections, items } from "@/lib/mock-data";

const stats = [
  {
    label: "Items",
    value: items.length,
    icon: Layers,
  },
  {
    label: "Collections",
    value: collections.length,
    icon: FolderHeart,
  },
  {
    label: "Favorite Items",
    value: items.filter((item) => item.isFavorite).length,
    icon: Heart,
  },
  {
    label: "Favorite Collections",
    value: collections.filter((collection) => collection.isFavorite).length,
    icon: Star,
  },
];

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <Icon className="size-4 text-muted-foreground" />
            </div>
            <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
          </div>
        );
      })}
    </div>
  );
}
