function normalizeSearchText(value: string): string {
  return value.trim().toLowerCase();
}

function getSearchWords(value: string): string[] {
  return normalizeSearchText(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function scoreFieldMatch(field: string, search: string): number {
  const normalizedSearch = normalizeSearchText(search);

  if (!normalizedSearch) {
    return 1;
  }

  if (!field.trim()) {
    return 0;
  }

  const words = getSearchWords(field);

  if (words.some((word) => word === normalizedSearch)) {
    return 1;
  }

  if (words.some((word) => word.startsWith(normalizedSearch))) {
    return 0.9;
  }

  return 0;
}

export function commandPaletteFilter(
  value: string,
  search: string,
  keywords?: string[],
): number {
  const primaryScore = scoreFieldMatch(value, search);

  if (primaryScore > 0) {
    return primaryScore;
  }

  if (!keywords?.length) {
    return 0;
  }

  const keywordScore = Math.max(
    ...keywords.map((keyword) => scoreFieldMatch(keyword, search)),
  );

  return keywordScore > 0 ? keywordScore * 0.8 : 0;
}
