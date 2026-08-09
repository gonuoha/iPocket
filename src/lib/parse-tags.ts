export function parseTagsString(tags: string): string[] {
  return tags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function appendTagToTagsString(tags: string, newTag: string): string {
  const existing = parseTagsString(tags);
  const normalized = newTag.toLowerCase();

  if (existing.some((tag) => tag.toLowerCase() === normalized)) {
    return tags;
  }

  return [...existing, newTag].join(", ");
}
