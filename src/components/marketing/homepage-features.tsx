import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import {
  HOMEPAGE_FEATURES,
  SYSTEM_ITEM_TYPE_COLORS,
} from "@/lib/marketing/homepage-content";

export function HomepageFeatures() {
  return (
    <section id="features" className="scroll-mt-20 bg-secondary/30 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll className="mx-auto mb-12 max-w-xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you save, one place to find it
          </h2>
          <p className="mt-3 text-lg text-muted-foreground">
            Built for how developers actually work — fast capture, instant recall.
          </p>
        </FadeInOnScroll>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {HOMEPAGE_FEATURES.map((feature) => {
            const Icon = feature.icon;
            const color = SYSTEM_ITEM_TYPE_COLORS[feature.type];

            return (
              <FadeInOnScroll key={feature.title}>
                <article
                  className="h-full rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-0.5"
                  style={{ borderTopWidth: "3px", borderTopColor: color }}
                >
                  <div
                    className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary"
                    style={{ color }}
                  >
                    <Icon className="size-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              </FadeInOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
