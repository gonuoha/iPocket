import Link from "next/link";

import { HomepageHeroVisual } from "@/components/marketing/homepage-hero-visual";
import { buttonVariants } from "@/components/ui/button";
import { SYSTEM_ITEM_TYPE_COLORS } from "@/lib/marketing/homepage-content";
import { cn } from "@/lib/utils";

export function HomepageHero() {
  return (
    <section className="px-6 pt-28 pb-16">
      <div className="mx-auto min-w-0 max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl motion-safe:animate-[homepage-fade-in_0.8s_ease-out_forwards] text-center">
          <h1 className="text-4xl leading-tight font-bold tracking-tight sm:text-5xl lg:text-[3.25rem]">
            Stop Losing Your{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: `linear-gradient(135deg, ${SYSTEM_ITEM_TYPE_COLORS.snippet}, var(--color-primary), ${SYSTEM_ITEM_TYPE_COLORS.image})`,
              }}
            >
              Developer Knowledge
            </span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Snippets in VS Code, prompts in Notion, commands in Slack, links in
            bookmarks — scattered everywhere. Memex brings it all into one
            searchable hub.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "min-h-11")}
            >
              Get Started Free
            </Link>
            <Link
              href="#features"
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "min-h-11",
              )}
            >
              See Features
            </Link>
          </div>
        </div>

        <div className="min-w-0 max-w-full motion-safe:animate-[homepage-fade-in_0.8s_ease-out_forwards]">
          <HomepageHeroVisual />
        </div>
      </div>
    </section>
  );
}
