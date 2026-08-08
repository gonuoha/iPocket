const { chromium } = require("/private/var/folders/9k/hmnkpyr50xbfb0xw0qs0_gr00000gp/T/cursor-sandbox-cache/3a92872908d1695c163d4ab16adaca2d/npm/_npx/e41f203b7505f1fb/node_modules/playwright");

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
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);

  const imgsNoAlt = await page.$$eval("img:not([alt])", (els) =>
    els.map((el) => el.src?.slice(0, 80) || "unknown"),
  );
  if (imgsNoAlt.length > 0) {
    addIssue(pageName, "major", viewportName, `${imgsNoAlt.length} image(s) missing alt text`, "Add descriptive alt attributes");
  }

  const smallTargets = await page.evaluate(() => {
    const interactive = document.querySelectorAll("a, button, [role='button'], input");
    const small = [];
    interactive.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        const text = (el.textContent?.trim().slice(0, 40) || el.getAttribute("aria-label") || el.tagName);
        small.push({ text, w: Math.round(rect.width), h: Math.round(rect.height) });
      }
    });
    return small;
  });

  const navSmall = smallTargets.filter((t) => /sign|get started|dashboard|menu/i.test(t.text));
  if (navSmall.length > 0) {
    addIssue(pageName, "minor", viewportName,
      `Navbar/auth controls below 44px: ${navSmall.map((t) => `${t.text} (${t.w}x${t.h})`).join(", ")}`,
      "Use size default or lg for primary nav actions on touch devices");
  }

  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
  );
  if (overflow) {
    addIssue(pageName, "major", viewportName, "Horizontal scroll overflow", "Fix elements exceeding viewport width");
  }

  const focusCheck = await page.evaluate(() => {
    const results = [];
    const els = document.querySelectorAll("a, button, input");
    for (const el of els) {
      el.focus();
      const style = getComputedStyle(el);
      const hasRing = style.outlineWidth !== "0px" || style.boxShadow !== "none";
      if (!hasRing) {
        results.push(el.textContent?.trim().slice(0, 30) || el.tagName);
      }
      if (results.length >= 3) break;
    }
    return results;
  });
  if (focusCheck.length > 0) {
    addIssue(pageName, "major", viewportName,
      `Weak/missing focus on: ${focusCheck.join(", ")}`,
      "Ensure focus-visible ring/outline on all interactive elements");
  }

  if (pageName === "Homepage") {
    const heroAboveFold = await page.evaluate(() => {
      const h1 = document.querySelector("h1");
      if (!h1) return { h1: false, cta: false };
      const h1Rect = h1.getBoundingClientRect();
      const cta = document.querySelector("a[href='/register']");
      const ctaRect = cta?.getBoundingClientRect();
      return {
        h1: h1Rect.top < window.innerHeight && h1Rect.bottom > 0,
        cta: ctaRect ? ctaRect.top < window.innerHeight : false,
      };
    });
    if (!heroAboveFold.h1) {
      addIssue("Homepage", "major", viewportName, "H1 not visible above the fold", "Reduce top padding or hero visual height");
    }
    if (!heroAboveFold.cta && viewportName === "mobile") {
      addIssue("Homepage", "minor", viewportName, "Primary CTA may be below fold on mobile", "Tighten hero spacing so CTA is visible without scroll");
    }

    if (viewportName === "mobile") {
      const navLinksVisible = await page.evaluate(() => {
        const links = document.querySelectorAll("nav a[href='#features'], nav a[href='#pricing']");
        return Array.from(links).some((l) => {
          const rect = l.getBoundingClientRect();
          return rect.width > 0 && getComputedStyle(l).display !== "none" && rect.height > 0;
        });
      });
      if (!navLinksVisible) {
        addIssue("Homepage", "major", viewportName,
          "Features/Pricing nav links hidden with no mobile menu",
          "Add hamburger menu or expose anchor links");
      }
    }

    const hasSocialProof = await page.evaluate(() => {
      const text = document.body.innerText.toLowerCase();
      return /testimonial|trusted by|users|reviews|companies|loved by|\d+\+/.test(text);
    });
    if (!hasSocialProof) {
      addIssue("Homepage", "minor", "all",
        "No social proof (testimonials, user counts, logos)",
        "Add trust section near hero or pricing");
    }

    const footerDeadLinks = await page.evaluate(() => {
      const dead = [];
      document.querySelectorAll("footer a[href='#']").forEach((a) => {
        dead.push(a.textContent?.trim());
      });
      return dead;
    });
    if (footerDeadLinks.length > 0) {
      addIssue("Homepage", "minor", viewportName,
        `Footer placeholder links (${footerDeadLinks.length}) point to #`,
        "Replace with real pages or remove until ready");
    }

    const pricingToggleSize = await page.evaluate(() => {
      const btn = document.querySelector("#pricing button");
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (pricingToggleSize && pricingToggleSize.h < 44) {
      addIssue("Homepage", "minor", viewportName,
        `Pricing period toggle height ${pricingToggleSize.h}px (< 44px)`,
        "Increase toggle button padding to min-h-11");
    }
  }

  if (pageName === "Dashboard") {
    const sidebarVisible = await page.evaluate(() => {
      const aside = document.querySelector("aside");
      if (!aside) return false;
      const rect = aside.getBoundingClientRect();
      const style = getComputedStyle(aside);
      return style.display !== "none" && rect.width > 0;
    });

    if (viewportName === "mobile" && sidebarVisible) {
      addIssue("Dashboard", "minor", viewportName,
        "Sidebar visible on mobile viewport (should be sheet-only)",
        "Verify aside is hidden below md breakpoint");
    }

    if (viewportName !== "mobile" && !sidebarVisible) {
      addIssue("Dashboard", "major", viewportName,
        "Sidebar not visible on tablet/desktop",
        "Check aside display rules at md+ breakpoints");
    }

    const recentEmpty = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("section h2, section + section h2"));
      const recent = document.body.innerText.includes("Recent Items");
      const hasRows = document.querySelectorAll("main .space-y-3 > *").length;
      return { recent, hasRows };
    });

    const statsOverflow = await page.evaluate(() => {
      const grid = document.querySelector(".grid.grid-cols-2");
      if (!grid) return false;
      return grid.scrollWidth > grid.clientWidth + 2;
    });
    if (statsOverflow && viewportName === "mobile") {
      addIssue("Dashboard", "minor", viewportName,
        "Stats cards grid may overflow on mobile",
        "Check 2-col grid spacing and label truncation");
    }

    const sectionHeadings = await page.evaluate(() =>
      Array.from(document.querySelectorAll("main h2")).map((h) => h.textContent?.trim()),
    );
    if (!sectionHeadings.includes("Collections")) {
      addIssue("Dashboard", "major", viewportName, "Collections section heading missing", "Verify dashboard content loads");
    }
  }
}

async function login(page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: "networkidle", timeout: 60000 });
  const emailInput = page.locator('input[type="email"], input[name="email"]');
  const passInput = page.locator('input[type="password"], input[name="password"]');
  await emailInput.fill("demo@ipocket.io");
  await passInput.fill("12345678");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const url = page.url();
  if (!url.includes("/dashboard")) {
    await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  }
  return page.url().includes("/dashboard");
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loggedIn = await login(page);
  console.log("LOGGED_IN:", loggedIn);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await checkPage(page, "Homepage", `${BASE}/`, vp.name);
    if (loggedIn) await checkPage(page, "Dashboard", `${BASE}/dashboard`, vp.name);
  }

  // Visual overlap check on homepage hero
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const overlap = await page.evaluate(() => {
    const nav = document.querySelector("nav");
    const h1 = document.querySelector("h1");
    if (!nav || !h1) return false;
    const n = nav.getBoundingClientRect();
    const h = h1.getBoundingClientRect();
    return h.top < n.bottom;
  });
  if (overlap) {
    addIssue("Homepage", "minor", "mobile", "Hero H1 may sit under fixed navbar", "Increase pt on hero section (currently pt-28)");
  }

  console.log(JSON.stringify({ issues, loggedIn, issueCount: issues.length }, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error("FATAL:", e.message);
  process.exit(1);
});
