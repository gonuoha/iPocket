import { notFound } from "next/navigation";

import { CollectionDetailActions } from "@/components/collections/collection-detail-actions";
import { CollectionItemSections } from "@/components/collections/collection-item-sections";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { getCollectionById } from "@/lib/db/collections";
import { getFileItemsByCollection, getItemsByCollection } from "@/lib/db/items";
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

  const [items, fileItems] = await Promise.all([
    getItemsByCollection(user.id, collection.id),
    getFileItemsByCollection(user.id, collection.id),
  ]);

  return (
    <PageContainer wide>
      <div className="flex items-start justify-between gap-4">
        <PageHeader
          title={collection.name}
          description={
            collection.description ??
            (items.length === 1 ? "1 item" : `${items.length} items`)
          }
        />
        <CollectionDetailActions collection={collection} />
      </div>

      {items.length > 0 ? (
        <CollectionItemSections items={items} fileItems={fileItems} />
      ) : (
        <p className="text-sm text-muted-foreground">
          No items in this collection yet.
        </p>
      )}
    </PageContainer>
  );
}
