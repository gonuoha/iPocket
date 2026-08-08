import { FadeInOnScroll } from "@/components/marketing/fade-in-on-scroll";
import { SOCIAL_PROOF } from "@/lib/marketing/homepage-content";

export function HomepageSocialProof() {
  return (
    <section className="border-y border-border bg-background px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <FadeInOnScroll className="text-center">
          <p className="text-sm font-medium tracking-wider text-muted-foreground uppercase">
            {SOCIAL_PROOF.eyebrow}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
            {SOCIAL_PROOF.logos.map((logo) => (
              <span
                key={logo}
                className="text-base font-semibold text-muted-foreground/80 sm:text-lg"
              >
                {logo}
              </span>
            ))}
          </div>

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {SOCIAL_PROOF.testimonials.map((testimonial) => (
              <blockquote
                key={testimonial.author}
                className="rounded-xl border border-border bg-card p-6 text-left"
              >
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <footer className="mt-3 text-sm font-medium">
                  {testimonial.author}
                </footer>
              </blockquote>
            ))}
          </div>
        </FadeInOnScroll>
      </div>
    </section>
  );
}
