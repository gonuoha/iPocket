import { readFileSync } from "fs";
import path from "path";

export function getHomepageMarkup(): string {
  const htmlPath = path.join(process.cwd(), "prototypes/homepage/index.html");
  const html = readFileSync(htmlPath, "utf-8");
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);

  if (!bodyMatch) {
    throw new Error("Homepage markup not found in prototypes/homepage/index.html");
  }

  return bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, "").trim();
}
