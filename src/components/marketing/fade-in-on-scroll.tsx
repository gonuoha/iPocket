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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-visible", "true");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-visible="false"
      className={cn(
        "translate-y-6 opacity-0 transition-all duration-500 ease-out motion-reduce:translate-y-0 motion-reduce:opacity-100 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100",
        className,
      )}
    >
      {children}
    </div>
  );
}
