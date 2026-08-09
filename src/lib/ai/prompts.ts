type AutoTagPromptInput = {
  title: string;
  type: string;
  content: string;
  existingTags: string[];
};

type AutoTagPrompt = {
  systemInstruction: string;
  userContent: string;
};

export function buildAutoTagPrompt(input: AutoTagPromptInput): AutoTagPrompt {
  const existingTagsText =
    input.existingTags.length > 0
      ? input.existingTags.join(", ")
      : "none";

  const systemInstruction = [
    "You are a tag suggester for a developer knowledge hub.",
    "Return only valid JSON matching the schema.",
    "Suggest 3 to 5 lowercase, hyphenated tags (e.g. react, use-effect, bash).",
    "Tags must be relevant to the item title and content.",
    "Do not duplicate tags already on the item.",
    "Do not use generic tags like misc or untagged.",
  ].join(" ");

  const userContent = [
    `Title: ${input.title}`,
    `Type: ${input.type}`,
    `Content: ${input.content}`,
    `Existing tags: ${existingTagsText}`,
  ].join("\n");

  return { systemInstruction, userContent };
}
