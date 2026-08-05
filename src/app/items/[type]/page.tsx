import { notFound } from "next/navigation";

import { ItemsGrid } from "@/components/items/item-card";
import { getItemsByType, getItemTypeBySlug } from "@/lib/db/items";
import { getItemTypeLabel } from "@/lib/item-type-styles";
import { getCurrentUser } from "@/lib/db/user";

type ItemsByTypePageProps = {
  params: Promise<{ type: string }>;
};

export default async function ItemsByTypePage({ params }: ItemsByTypePageProps) {
  const { type: typeSlug } = await params;
  const user = await getCurrentUser();
  const itemType = await getItemTypeBySlug(user.id, typeSlug);

  if (!itemType) {
    notFound();
  }

  const items = await getItemsByType(user.id, itemType.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">
          {getItemTypeLabel(itemType.name, { plural: true })}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length === 1 ? "1 item" : `${items.length} items`}
        </p>
      </div>

      {items.length > 0 ? (
        <ItemsGrid items={items} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No {itemType.name} items yet.
        </p>
      )}
    </div>
  );
}
