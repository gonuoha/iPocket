type ItemCopySource = {
  title: string;
  description?: string | null;
  content?: string | null;
  url?: string | null;
  fileName?: string | null;
};

export function getItemCopyText(item: ItemCopySource): string {
  return (
    item.content ??
    item.url ??
    item.fileName ??
    item.description ??
    item.title
  );
}
