export function truncateForAi(content: string, maxLength = 2000): string {
  const trimmed = content.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const slice = trimmed.slice(0, maxLength);
  const lastSpace = slice.lastIndexOf(" ");

  if (lastSpace > maxLength * 0.8) {
    return `${slice.slice(0, lastSpace)}…`;
  }

  return `${slice}…`;
}
