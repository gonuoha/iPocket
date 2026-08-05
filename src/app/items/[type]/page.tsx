import { notFound } from "next/navigation";

import { ItemsGrid } from "@/components/items/item-card";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
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
    <PageContainer wide>
      <PageHeader
        title={getItemTypeLabel(itemType.name, { plural: true })}
        description={items.length === 1 ? "1 item" : `${items.length} items`}
      />

      {items.length > 0 ? (
        <ItemsGrid items={items} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No {itemType.name} items yet.
        </p>
      )}
    </PageContainer>
  );
}
