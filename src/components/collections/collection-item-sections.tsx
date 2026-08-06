import { FileList } from "@/components/items/file-list";
import { ImageGalleryGrid } from "@/components/items/image-thumbnail-card";
import { ItemsGrid } from "@/components/items/item-card";
import type { CollectionItemType } from "@/lib/db/collections";
import type { DashboardItem, FileListItem } from "@/lib/db/items";
import { getItemTypeLabel, sortItemTypesBySystemOrder } from "@/lib/item-type-styles";

type CollectionItemSectionsProps = {
  items: DashboardItem[];
  fileItems: FileListItem[];
};

type ItemTypeGroup = {
  type: CollectionItemType;
  items: DashboardItem[];
};

function groupItemsByType(items: DashboardItem[]): ItemTypeGroup[] {
  const groups = new Map<string, ItemTypeGroup>();

  for (const item of items) {
    const key = item.type.name.toLowerCase();
    const existing = groups.get(key);

    if (existing) {
      existing.items.push(item);
    } else {
      groups.set(key, { type: item.type, items: [item] });
    }
  }

  return sortItemTypesBySystemOrder(
    [...groups.values()].map((group) => ({ ...group, name: group.type.name })),
  ).map(({ type, items: groupItems }) => ({ type, items: groupItems }));
}

function renderTypeSection(
  group: ItemTypeGroup,
  fileItems: FileListItem[],
) {
  const typeName = group.type.name.toLowerCase();

  if (typeName === "file") {
    return <FileList items={fileItems} />;
  }

  if (typeName === "image") {
    return <ImageGalleryGrid items={group.items} />;
  }

  return <ItemsGrid items={group.items} />;
}

export function CollectionItemSections({
  items,
  fileItems,
}: CollectionItemSectionsProps) {
  const groups = groupItemsByType(items);

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.type.id}>
          <h2 className="text-lg font-semibold">
            {getItemTypeLabel(group.type.name, { plural: true })}
          </h2>
          <div className="mt-4">
            {renderTypeSection(group, fileItems)}
          </div>
        </section>
      ))}
    </div>
  );
}
