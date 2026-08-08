import Link from "next/link";

import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HomepageCta() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-pink-500/10 px-8 py-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Organize Your Knowledge?
          </h2>
          <p className="mt-2 text-muted-foreground">
            Join developers who stopped losing snippets, prompts, and commands.
          </p>
          <Link
            href="/register"
            className={cn(buttonVariants({ size: "lg" }), "mt-6 min-h-11")}
          >
            Get Started Free
          </Link>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
