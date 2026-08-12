import { Check } from "lucide-react";

import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import { Badge } from "@/components/ui/badge";
import {
  AI_CHECKLIST,
  AI_DEMO_TAGS,
  SYSTEM_ITEM_TYPE_COLORS,
} from "@/lib/marketing/homepage-content";

export function HomepageAiSection() {
  return (
    <section id="ai" className="px-6 py-20">
      <div className="mx-auto grid min-w-0 max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <FadeInOnScroll className="min-w-0 max-w-full">
          <Badge
            className="mb-4 border-0 text-white"
            style={{
              backgroundImage: `linear-gradient(135deg, var(--color-primary), ${SYSTEM_ITEM_TYPE_COLORS.image})`,
            }}
          >
            Pro Feature
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            AI that understands your knowledge
          </h2>
          <p className="mt-3 text-muted-foreground">
            Let AI tag, summarize, and organize your items so you spend less time
            filing and more time building.
          </p>
          <ul className="mt-6 space-y-2">
            {AI_CHECKLIST.map((item) => (
              <li key={item} className="flex items-center gap-3 text-[0.9375rem]">
                <Check
                  className="size-5 shrink-0"
                  style={{ color: SYSTEM_ITEM_TYPE_COLORS.note }}
                />
                {item}
              </li>
            ))}
          </ul>
        </FadeInOnScroll>

        <FadeInOnScroll className="min-w-0 max-w-full">
          <div className="min-w-0 max-w-full overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-border bg-secondary/50 px-4 py-3">
              <span className="size-2 rounded-full bg-red-500" />
              <span className="size-2 rounded-full bg-yellow-500" />
              <span className="size-2 rounded-full bg-green-500" />
              <span className="ml-2 text-xs text-muted-foreground">typescript</span>
            </div>
            <pre className="max-w-full overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed">
              <code className="block max-w-full">
                <span className="text-[#c678dd]">async function</span>{" "}
                <span className="text-[#61afef]">fetchUser</span>(
                <span className="text-[#e5c07b]">id</span>:{" "}
                <span className="text-[#56b6c2]">string</span>) {"{"}
                {"\n  "}
                <span className="text-[#c678dd]">const</span> res ={" "}
                <span className="text-[#c678dd]">await</span> fetch(
                <span className="text-[#98c379]">{`\`/api/users/\${id}\``}</span>
                );
                {"\n  "}
                <span className="text-[#c678dd]">return</span> res.json();
                {"\n}"}
              </code>
            </pre>
            <div className="border-t border-border bg-secondary/50 p-4">
              <span
                className="mb-2 block text-[0.6875rem] font-semibold tracking-wider uppercase"
                style={{ color: SYSTEM_ITEM_TYPE_COLORS.prompt }}
              >
                AI Generated Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {AI_DEMO_TAGS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-card px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
