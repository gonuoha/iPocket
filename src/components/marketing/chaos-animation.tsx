"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

const ICON_SIZE = 36;
const REPEL_RADIUS = 80;
const REPEL_FORCE = 0.15;
const BOUNCE_DAMPING = 0.95;
const SPEED = 0.4;

type ChaosIcon = {
  id: string;
  className?: string;
  icon: React.ReactNode;
};

const CHAOS_ICONS: ChaosIcon[] = [
  {
    id: "notion",
    className: "text-white",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 2.066c-.42-.326-.98-.7-2.055-.607L3.01 2.59c-.466.046-.56.28-.374.466l1.823 1.332zm.793 3.08v13.904c0 .747.374 1.026 1.215.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.748.327-.748.933zm14.337.606c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.449.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.298L7.822 9.17c-.093-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933z" />
      </svg>
    ),
  },
  {
    id: "github",
    className: "text-neutral-200",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.5 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    id: "slack",
    className: "text-[#e01e5a]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.808 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.808 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.808 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.808zM8.808 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.808a2.528 2.528 0 0 1 2.522-2.521h6.314zM18.956 8.808a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.808a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.808zM17.688 8.808a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.314zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.528 2.528 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.528 2.528 0 0 1-2.52-2.523 2.528 2.528 0 0 1 2.52-2.52h6.315A2.528 2.528 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" />
      </svg>
    ),
  },
  {
    id: "vscode",
    className: "text-[#0078d4]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
        <path d="M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.885.29l-9.471 8.966-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.472 8.966a1.49 1.49 0 0 0 1.884.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-3.415 11.59l-3.124-1.893 3.124-1.892 1.893 3.124-1.893 1.881z" />
      </svg>
    ),
  },
  {
    id: "browser",
    className: "text-[#3b82f6]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 8h20M8 3v5" />
      </svg>
    ),
  },
  {
    id: "terminal",
    className: "text-[#f97316]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </svg>
    ),
  },
  {
    id: "file",
    className: "text-[#6b7280]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    id: "bookmark",
    className: "text-[#8b5cf6]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-5">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
];

type Particle = {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  pulseOffset: number;
};

function getIconPosition(
  index: number,
  total: number,
  width: number,
  height: number,
) {
  const angle = (index / total) * Math.PI * 2;
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) * 0.25;

  return {
    x: cx + Math.cos(angle) * radius - ICON_SIZE / 2,
    y: cy + Math.sin(angle) * radius - ICON_SIZE / 2,
  };
}

function layoutIconsStatically(container: HTMLDivElement, icons: HTMLDivElement[]) {
  const { width, height } = container.getBoundingClientRect();

  icons.forEach((icon, index) => {
    const { x, y } = getIconPosition(index, icons.length, width, height);
    icon.style.transform = `translate(${x}px, ${y}px)`;
  });
}

export function ChaosAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const pulseTimeRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const getBounds = () => {
      const rect = container.getBoundingClientRect();
      return { width: rect.width, height: rect.height };
    };

    if (prefersReducedMotion) {
      const icons = iconRefs.current.filter(
        (icon): icon is HTMLDivElement => icon !== null,
      );

      const layoutStatic = () => layoutIconsStatically(container, icons);

      layoutStatic();
      window.addEventListener("resize", layoutStatic);

      return () => window.removeEventListener("resize", layoutStatic);
    }

    const initParticles = () => {
      const bounds = getBounds();
      particlesRef.current = CHAOS_ICONS.flatMap((_, index, icons) => {
        const el = iconRefs.current[index];
        if (!el) {
          return [];
        }

        const { x, y } = getIconPosition(
          index,
          icons.length,
          bounds.width,
          bounds.height,
        );

        return [
          {
            el,
            x,
            y,
            vx: (Math.random() - 0.5) * SPEED * 2,
            vy: (Math.random() - 0.5) * SPEED * 2,
            rotation: Math.random() * 360,
            rotSpeed: (Math.random() - 0.5) * 0.5,
            pulseOffset: Math.random() * Math.PI * 2,
          },
        ];
      });
    };

    const onMouseMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    const animate = () => {
      const bounds = getBounds();
      const maxX = bounds.width - ICON_SIZE;
      const maxY = bounds.height - ICON_SIZE;
      pulseTimeRef.current += 0.02;

      particlesRef.current.forEach((particle) => {
        const centerX = particle.x + ICON_SIZE / 2;
        const centerY = particle.y + ICON_SIZE / 2;
        const dx = centerX - mouseRef.current.x;
        const dy = centerY - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < REPEL_RADIUS && distance > 0) {
          const force = ((REPEL_RADIUS - distance) / REPEL_RADIUS) * REPEL_FORCE;
          particle.vx += (dx / distance) * force;
          particle.vy += (dy / distance) * force;
        }

        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;

        const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
        if (speed > SPEED * 3) {
          particle.vx = (particle.vx / speed) * SPEED * 3;
          particle.vy = (particle.vy / speed) * SPEED * 3;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x <= 0) {
          particle.x = 0;
          particle.vx = -particle.vx * BOUNCE_DAMPING;
        }
        if (particle.x >= maxX) {
          particle.x = maxX;
          particle.vx = -particle.vx * BOUNCE_DAMPING;
        }
        if (particle.y <= 0) {
          particle.y = 0;
          particle.vy = -particle.vy * BOUNCE_DAMPING;
        }
        if (particle.y >= maxY) {
          particle.y = maxY;
          particle.vy = -particle.vy * BOUNCE_DAMPING;
        }

        particle.rotation += particle.rotSpeed;
        const scale =
          1 + Math.sin(pulseTimeRef.current + particle.pulseOffset) * 0.08;

        particle.el.style.transform = `translate(${particle.x}px, ${particle.y}px) rotate(${particle.rotation}deg) scale(${scale})`;
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    container.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseleave", onMouseLeave);
    frameRef.current = requestAnimationFrame(animate);

    return () => {
      container.removeEventListener("mousemove", onMouseMove);
      container.removeEventListener("mouseleave", onMouseLeave);
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[220px] overflow-hidden rounded-lg bg-card sm:h-[220px]"
      aria-hidden="true"
    >
      {CHAOS_ICONS.map((icon, index) => (
        <div
          key={icon.id}
          ref={(element) => {
            iconRefs.current[index] = element;
          }}
          className={cn(
            "absolute flex size-9 items-center justify-center rounded-lg border border-border bg-secondary will-change-transform",
            icon.className,
          )}
        >
          {icon.icon}
        </div>
      ))}
    </div>
  );
}
