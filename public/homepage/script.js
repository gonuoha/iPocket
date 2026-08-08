/**
 * iPocket homepage prototype — chaos animation, scroll effects, pricing toggle
 */

(function () {
  "use strict";

  // Copyright year
  const yearEl = document.getElementById("copyright-year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  // Navbar scroll opacity
  const navbar = document.getElementById("navbar");
  function onScroll() {
    if (navbar) {
      navbar.classList.toggle("scrolled", window.scrollY > 20);
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll fade-in
  const scrollEls = document.querySelectorAll(".fade-in-scroll");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  scrollEls.forEach((el) => observer.observe(el));

  // Pricing toggle
  const toggleBtns = document.querySelectorAll(".toggle-btn");
  const proPrice = document.getElementById("pro-price");
  const proPeriod = document.getElementById("pro-period");

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      toggleBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const period = btn.dataset.period;
      if (proPrice && proPeriod) {
        if (period === "yearly") {
          proPrice.textContent = "$72";
          proPeriod.textContent = "/year";
        } else {
          proPrice.textContent = "$8";
          proPeriod.textContent = "/month";
        }
      }
    });
  });

  // Chaos icon animation
  const container = document.getElementById("chaos-container");
  if (!container) return;

  const icons = container.querySelectorAll(".chaos-icon");
  const ICON_SIZE = 36;
  const REPEL_RADIUS = 80;
  const REPEL_FORCE = 0.15;
  const BOUNCE_DAMPING = 0.95;
  const SPEED = 0.4;

  let mouseX = -1000;
  let mouseY = -1000;
  let pulseTime = 0;

  const particles = [];

  function getBounds() {
    const rect = container.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }

  icons.forEach((el, i) => {
    const bounds = getBounds();
    const angle = (i / icons.length) * Math.PI * 2;
    const cx = bounds.width / 2;
    const cy = bounds.height / 2;
    const r = Math.min(bounds.width, bounds.height) * 0.25;

    particles.push({
      el,
      x: cx + Math.cos(angle) * r - ICON_SIZE / 2,
      y: cy + Math.sin(angle) * r - ICON_SIZE / 2,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      pulseOffset: Math.random() * Math.PI * 2,
    });
  });

  container.addEventListener("mousemove", (e) => {
    const rect = container.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });

  container.addEventListener("mouseleave", () => {
    mouseX = -1000;
    mouseY = -1000;
  });

  function animate() {
    const bounds = getBounds();
    const maxX = bounds.width - ICON_SIZE;
    const maxY = bounds.height - ICON_SIZE;
    pulseTime += 0.02;

    particles.forEach((p) => {
      // Cursor repulsion
      const centerX = p.x + ICON_SIZE / 2;
      const centerY = p.y + ICON_SIZE / 2;
      const dx = centerX - mouseX;
      const dy = centerY - mouseY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < REPEL_RADIUS && dist > 0) {
        const force = (REPEL_RADIUS - dist) / REPEL_RADIUS * REPEL_FORCE;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }

      // Drift with slight randomness
      p.vx += (Math.random() - 0.5) * 0.02;
      p.vy += (Math.random() - 0.5) * 0.02;

      // Speed limit
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > SPEED * 3) {
        p.vx = (p.vx / speed) * SPEED * 3;
        p.vy = (p.vy / speed) * SPEED * 3;
      }

      p.x += p.vx;
      p.y += p.vy;

      // Wall bounce
      if (p.x <= 0) {
        p.x = 0;
        p.vx = -p.vx * BOUNCE_DAMPING;
      }
      if (p.x >= maxX) {
        p.x = maxX;
        p.vx = -p.vx * BOUNCE_DAMPING;
      }
      if (p.y <= 0) {
        p.y = 0;
        p.vy = -p.vy * BOUNCE_DAMPING;
      }
      if (p.y >= maxY) {
        p.y = maxY;
        p.vy = -p.vy * BOUNCE_DAMPING;
      }

      // Rotation
      p.rotation += p.rotSpeed;

      // Scale pulse
      const scale = 1 + Math.sin(pulseTime + p.pulseOffset) * 0.08;

      p.el.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${p.rotation}deg) scale(${scale})`;
    });

    requestAnimationFrame(animate);
  }

  // Wait for layout before starting
  requestAnimationFrame(() => {
    requestAnimationFrame(animate);
  });
})();
