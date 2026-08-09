type SummaryContentInput = {
  type: string;
  content?: string;
  url?: string;
  fileName?: string | null;
  language?: string;
};

export function buildSummaryContent(input: SummaryContentInput): string {
  const parts: string[] = [];
  const trimmedContent = input.content?.trim() ?? "";
  const trimmedUrl = input.url?.trim() ?? "";
  const trimmedFileName = input.fileName?.trim() ?? "";
  const trimmedLanguage = input.language?.trim() ?? "";

  if (trimmedContent) {
    parts.push(trimmedContent);
  }

  if (trimmedUrl) {
    parts.push(`URL: ${trimmedUrl}`);
  }

  if (trimmedFileName) {
    parts.push(`File: ${trimmedFileName}`);
  }

  if (trimmedLanguage) {
    parts.push(`Language: ${trimmedLanguage}`);
  }

  if (parts.length === 0 && input.type) {
    parts.push(`Type: ${input.type}`);
  }

  return parts.join("\n");
}

export function canGenerateSummary(
  title: string,
  input: SummaryContentInput,
): boolean {
  return title.trim().length > 0 && buildSummaryContent(input).length > 0;
}
