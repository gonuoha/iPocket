import { chromium } from "playwright";

const BASE = "http://127.0.0.1:3000";
const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
];

const issues = [];

function addIssue(page, severity, viewports, description, fix) {
  issues.push({ page, severity, viewports, description, fix });
}

async function checkPage(page, pageName, url, viewportName) {
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(1500);

  // Images without alt
  const imgsNoAlt = await page.$$eval("img:not([alt])", (els) =>
    els.map((el) => el.src?.slice(0, 80) || "unknown"),
  );
  if (imgsNoAlt.length > 0) {
    addIssue(
      pageName,
      "major",
      viewportName,
      `${imgsNoAlt.length} image(s) missing alt text`,
      "Add descriptive alt attributes to all images",
    );
  }

  // Small touch targets (< 44px)
  const smallTargets = await page.evaluate(() => {
    const interactive = document.querySelectorAll(
      "a, button, [role='button'], input, select, textarea, [tabindex]:not([tabindex='-1'])",
    );
    const small = [];
    interactive.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const text = (el.textContent?.trim().slice(0, 40) || el.getAttribute("aria-label") || el.tagName);
        small.push({ text, w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    });
    return small.slice(0, 15);
  });
  if (smallTargets.length > 5) {
    addIssue(
      pageName,
      "minor",
      viewportName,
      `${smallTargets.length}+ interactive elements below 44px touch target (e.g. ${smallTargets[0]?.text} ${smallTargets[0]?.w}x${smallTargets[0]?.h}px)`,
      "Increase padding/min-height to meet 44px minimum for primary actions",
    );
  }

  // Horizontal overflow
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
  });
  if (overflow) {
    addIssue(
      pageName,
      "major",
      viewportName,
      "Horizontal scroll overflow detected",
      "Fix elements exceeding viewport width",
    );
  }

  // Focus visibility check on first focusable
  const focusVisible = await page.evaluate(() => {
    const el = document.querySelector("a, button, input");
    if (!el) return true;
    el.focus();
    const style = getComputedStyle(el);
    const outline = style.outlineWidth;
    const boxShadow = style.boxShadow;
    return outline !== "0px" || boxShadow !== "none";
  });
  if (!focusVisible) {
    addIssue(
      pageName,
      "major",
      viewportName,
      "Focus state may not be visible on interactive elements",
      "Ensure visible focus ring (outline or ring) on keyboard focus",
    );
  }

  if (pageName === "Homepage") {
  // Value prop above fold
    const heroVisible = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return false;
      const rect = h1.getBoundingClientRect();
      return rect.top < window.innerHeight && rect.bottom > 0;
    });
    if (!heroVisible) {
      addIssue(
        "Homepage",
        "critical",
        viewportName,
        "H1/value proposition not visible above the fold",
        "Reduce hero padding or shrink visual so headline is visible on first screen",
      );
    }

    // Nav links hidden on mobile
    if (viewportName === "mobile") {
      const navLinksVisible = await page.evaluate(() => {
        const links = document.querySelectorAll("nav a[href='#features'], nav a[href='#pricing']");
        return links.length > 0 && Array.from(links).some((l) => {
          const rect = l.getBoundingClientRect();
          return rect.width > 0 && getComputedStyle(l).display !== "none";
        });
      });
      if (!navLinksVisible) {
        addIssue(
          "Homepage",
          "major",
          viewportName,
          "Features/Pricing nav links hidden on mobile (no hamburger menu)",
          "Add mobile nav menu or expose anchor links for in-page navigation",
        );
      }
    }

    // Social proof
    const hasSocialProof = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return /testimonial|trusted by|users|reviews|companies|loved by/.test(text);
    });
    if (!hasSocialProof) {
      addIssue(
        "Homepage",
        "minor",
        viewportName,
        "No social proof section (testimonials, user count, logos)",
        "Add trust signals below hero or near pricing",
      );
    }
  }

  if (pageName === "Dashboard") {
    const hasEmptyState = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return text.includes("no items") || text.includes("empty") || text.includes("get started");
    });
    const itemRows = await page.$$("[data-slot], .space-y-3 > *");
    // Check nav clarity
    const navItems = await page.evaluate(() => {
      const nav = document.querySelector("nav, aside, [role='navigation']");
      return nav ? nav.innerText.slice(0, 200) : "";
    });
    if (!navItems.trim()) {
      addIssue(
        "Dashboard",
        "major",
        viewportName,
        "Navigation sidebar/nav not clearly identifiable",
        "Ensure sidebar nav is visible and labeled",
      );
    }
  }
}

async function login(page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle", timeout: 30000 });
  await page.fill('input[type="email"], input[name="email"]', "demo@ipocket.io");
  await page.fill('input[type="password"], input[name="password"]', "12345678");
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard|sign-in/, { timeout: 15000 });
  const url = page.url();
  if (!url.includes("/dashboard")) {
    // try navigating
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  }
  return page.url().includes("/dashboard");
}

async function main() {
  // Quick connectivity check
  try {
    const res = await fetch(BASE);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (e) {
    console.log("SERVER_ERROR:", e.message);
    process.exit(2);
  }

  const browser = await chromium.launch({
    headless: true,
    channel: "chrome",
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loggedIn = await login(page);
  console.log("LOGGED_IN:", loggedIn, page.url());

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await checkPage(page, "Homepage", `${BASE}/`, vp.name);
    if (loggedIn) {
      await checkPage(page, "Dashboard", `${BASE}/dashboard`, vp.name);
    }
  }

  // Dedupe similar issues
  console.log(JSON.stringify({ issues, loggedIn }, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
