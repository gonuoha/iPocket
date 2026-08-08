"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type FadeInOnScrollProps = {
  children: ReactNode;
  className?: string;
};

export function FadeInOnScroll({ children, className }: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) {
      element.dataset.visible = "true";
      return;
    }

    const show = () => {
      element.dataset.visible = "true";
    };

    const rect = element.getBoundingClientRect();
    const inView = rect.top < window.innerHeight * 0.9;

    if (!inView) {
      element.dataset.enhanced = "true";
      element.dataset.visible = "false";
    } else {
      show();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);

    const fallback = window.setTimeout(show, 800);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      data-visible="true"
      className={cn(
        "transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100",
        "data-[enhanced=true]:translate-y-6 data-[enhanced=true]:opacity-0 data-[enhanced=true]:data-[visible=true]:translate-y-0 data-[enhanced=true]:data-[visible=true]:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
