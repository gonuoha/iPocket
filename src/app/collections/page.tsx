import { CollectionsGrid } from "@/components/dashboard/collection-card";
import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { getAllCollections } from "@/lib/db/collections";
import { getCurrentUser } from "@/lib/db/user";

export default async function CollectionsPage() {
  const user = await getCurrentUser();
  const collections = await getAllCollections(user.id);

  return (
    <PageContainer wide>
      <PageHeader
        title="Collections"
        description={
          collections.length === 1
            ? "1 collection"
            : `${collections.length} collections`
        }
      />

      {collections.length > 0 ? (
        <CollectionsGrid collections={collections} />
      ) : (
        <p className="text-sm text-muted-foreground">No collections yet.</p>
      )}
    </PageContainer>
  );
}
