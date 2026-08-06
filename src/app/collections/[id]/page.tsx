import { notFound } from "next/navigation";

import { ItemsGrid } from "@/components/items/item-card";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { getCollectionById } from "@/lib/db/collections";
import { getItemsByCollection } from "@/lib/db/items";
import { getCurrentUser } from "@/lib/db/user";

type CollectionDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CollectionDetailPage({
  params,
}: CollectionDetailPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  const collection = await getCollectionById(user.id, id);

  if (!collection) {
    notFound();
  }

  const items = await getItemsByCollection(user.id, collection.id);

  return (
    <PageContainer wide>
      <PageHeader
        title={collection.name}
        description={
          collection.description ??
          (items.length === 1 ? "1 item" : `${items.length} items`)
        }
      />

      {items.length > 0 ? (
        <ItemsGrid items={items} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No items in this collection yet.
        </p>
      )}
    </PageContainer>
  );
}
