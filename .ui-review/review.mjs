import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), '.ui-review', 'screenshots');
const VIEWPORTS = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 900 },
];

const issues = [];

function addIssue(group, severity, viewport, description, fix) {
  issues.push({ group, severity, viewport, description, fix });
}

async function auditPage(page, pageName) {
  const results = await page.evaluate(() => {
    const getRect = (el) => {
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height, top: r.top, left: r.left };
    };

    const imgsNoAlt = [...document.querySelectorAll('img')].filter(
      (img) => !img.getAttribute('alt') && img.getAttribute('alt') !== ''
    ).map((img) => img.src?.slice(0, 80) || 'inline');

    const imgsMissingAlt = [...document.querySelectorAll('img')].filter(
      (img) => img.getAttribute('alt') === null
    ).length;

    const imgsEmptyAltDecorative = [...document.querySelectorAll('img[alt=""]')].length;

    const smallTargets = [];
    const interactive = [
      ...document.querySelectorAll(
        'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ),
    ];
    for (const el of interactive) {
      const style = getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || el.offsetParent === null) continue;
      const r = getRect(el);
      if (r.w < 44 || r.h < 44) {
        const text = (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40);
        smallTargets.push({ text, w: Math.round(r.w), h: Math.round(r.h) });
      }
    }

    const headings = [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => ({
      tag: h.tagName,
      text: h.textContent?.trim().slice(0, 60),
    }));

    const sections = [...document.querySelectorAll('section, header, footer, nav, main')].map((s) => ({
      tag: s.tagName,
      id: s.id || null,
      aria: s.getAttribute('aria-label'),
      h: s.getBoundingClientRect().height,
    }));

    const overlaps = [];
    const visibleEls = [...document.querySelectorAll('body *')].filter((el) => {
      const s = getComputedStyle(el);
      return s.display !== 'none' && s.visibility !== 'hidden' && el.getBoundingClientRect().height > 0;
    });
    const nav = document.querySelector('nav, header');
    if (nav) {
      const navRect = nav.getBoundingClientRect();
      for (const el of visibleEls) {
        if (nav.contains(el) || el === nav) continue;
        const r = el.getBoundingClientRect();
        if (r.top < navRect.bottom && r.bottom > navRect.top && r.height > 20) {
          const text = (el.textContent || '').trim().slice(0, 30);
          if (text && r.top < navRect.bottom - 5) {
            overlaps.push({ underNav: text, navBottom: navRect.bottom, elTop: r.top });
            break;
          }
        }
      }
    }

    const lowContrastCandidates = [];
    const textEls = [...document.querySelectorAll('p, span, a, button, li, h1, h2, h3, h4, small')].slice(0, 200);
    for (const el of textEls) {
      const s = getComputedStyle(el);
      const color = s.color;
      const bg = s.backgroundColor;
      if (color.includes('128') || color.includes('156') || color.includes('163')) {
        lowContrastCandidates.push({
          text: el.textContent?.trim().slice(0, 40),
          color,
          bg,
        });
      }
    }

    const focusableCount = interactive.length;

    return {
      title: document.title,
      h1Count: document.querySelectorAll('h1').length,
      headings,
      sections,
      imgsMissingAlt,
      imgsEmptyAltDecorative,
      imgCount: document.querySelectorAll('img').length,
      smallTargets: smallTargets.slice(0, 20),
      overlaps: overlaps.slice(0, 5),
      lowContrastCandidates: lowContrastCandidates.slice(0, 8),
      focusableCount,
      bodyText: document.body.innerText.slice(0, 500),
      hasMain: !!document.querySelector('main'),
      skipLink: !!document.querySelector('a[href="#main"], a[href="#content"]'),
    };
  });

  return results;
}

async function testFocusVisible(page) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(150);
  const focusInfo = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || el === document.body) return { visible: false, tag: 'body' };
    const s = getComputedStyle(el);
    const outline = s.outline;
    const boxShadow = s.boxShadow;
    const ring = el.className?.toString?.() || '';
    return {
      visible: outline !== 'none' || boxShadow !== 'none' || ring.includes('ring'),
      tag: el.tagName,
      text: el.textContent?.trim().slice(0, 30),
      outline,
      boxShadow: boxShadow !== 'none' ? boxShadow.slice(0, 60) : 'none',
    };
  });
  return focusInfo;
}

async function screenshot(page, name) {
  const file = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function screenshotFull(page, name) {
  const file = path.join(OUT, `${name}-full.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

async function reviewHomepage(browser) {
  const homepageData = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(800);

    const audit = await auditPage(page, 'homepage');
    const focus = await testFocusVisible(page);

    const sectionIds = await page.evaluate(() =>
      [...document.querySelectorAll('[id]')].map((el) => el.id).filter(Boolean)
    );

    const heroVisible = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      if (!h1) return false;
      const r = h1.getBoundingClientRect();
      return r.top >= 0 && r.top < window.innerHeight;
    });

    const ctaButtons = await page.evaluate(() =>
      [...document.querySelectorAll('a, button')]
        .filter((el) => /get started|sign in|start free/i.test(el.textContent || ''))
        .map((el) => {
          const r = el.getBoundingClientRect();
          return { text: el.textContent?.trim(), w: r.width, h: r.height, top: r.top };
        })
    );

    const navLinks = await page.evaluate(() => {
      const nav = document.querySelector('nav, header');
      if (!nav) return [];
      return [...nav.querySelectorAll('a')].map((a) => ({
        text: a.textContent?.trim(),
        href: a.getAttribute('href'),
        visible: a.getBoundingClientRect().width > 0,
      }));
    });

    const mobileMenu = await page.evaluate(() => {
      const btn = document.querySelector('[aria-label*="menu" i], button[class*="menu" i], [data-slot="sheet-trigger"]');
      return { hasMenuButton: !!btn, menuBtnSize: btn ? btn.getBoundingClientRect() : null };
    });

    await screenshot(page, `homepage-${vp.name}`);
    if (vp.name === 'desktop') await screenshotFull(page, 'homepage-desktop');

    homepageData[vp.name] = { audit, focus, sectionIds, heroVisible, ctaButtons, navLinks, mobileMenu };

    if (audit.h1Count !== 1) {
      addIssue('homepage', audit.h1Count === 0 ? 'critical' : 'major', vp.name, `Expected 1 h1, found ${audit.h1Count}`, 'Ensure single h1 in hero');
    }
    if (!heroVisible && vp.name !== 'mobile') {
      addIssue('homepage', 'major', vp.name, 'Hero headline not visible above fold', 'Adjust hero layout/padding');
    }
    if (audit.smallTargets.length > 0) {
      for (const t of audit.smallTargets.slice(0, 5)) {
        addIssue('homepage', 'major', vp.name, `Small touch target: "${t.text}" (${t.w}x${t.h}px)`, 'Increase min size to 44x44px');
      }
    }
    if (!focus.visible) {
      addIssue('cross-cutting', 'major', vp.name, 'No visible focus indicator on first Tab', 'Add focus-visible ring styles');
    }
    if (vp.name === 'mobile' && navLinks.filter((l) => l.visible && /features|pricing/i.test(l.text || '')).length > 0) {
      addIssue('homepage', 'minor', vp.name, 'Desktop nav links visible on mobile — may crowd navbar', 'Hide anchor links behind hamburger menu');
    }

    await context.close();
  }

  return homepageData;
}

async function login(page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  await page.fill('input[type="email"], input[name="email"]', 'demo@ipocket.io');
  await page.fill('input[type="password"], input[name="password"]', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL(/dashboard/, { timeout: 15000 }).catch(async () => {
    await page.waitForTimeout(2000);
  });
}

async function reviewDashboard(browser) {
  const dashboardData = {};

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await login(page);
    if (!page.url().includes('/dashboard')) {
      await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
    }
    await page.waitForTimeout(1000);

    const audit = await auditPage(page, 'dashboard');
    const focus = await testFocusVisible(page);

    const layout = await page.evaluate(() => {
      const sidebar = document.querySelector('[data-sidebar], aside, nav');
      const main = document.querySelector('main');
      const sidebarRect = sidebar?.getBoundingClientRect();
      const mainRect = main?.getBoundingClientRect();
      return {
        hasSidebar: !!sidebar,
        sidebarWidth: sidebarRect?.width,
        mainLeft: mainRect?.left,
        mainWidth: mainRect?.width,
        horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    await screenshot(page, `dashboard-${vp.name}`);
    if (vp.name === 'desktop') await screenshotFull(page, 'dashboard-desktop');

    dashboardData[vp.name] = { audit, focus, layout };

    if (audit.smallTargets.length > 0) {
      for (const t of audit.smallTargets.slice(0, 8)) {
        addIssue('dashboard', 'major', vp.name, `Small touch target: "${t.text}" (${t.w}x${t.h}px)`, 'Increase tap area to 44x44px');
      }
    }
    if (layout.horizontalScroll) {
      addIssue('cross-cutting', 'major', vp.name, 'Horizontal scroll detected', 'Fix overflow on page elements');
    }
    if (!focus.visible) {
      addIssue('cross-cutting', 'major', vp.name, 'Dashboard: no visible focus on Tab', 'Add focus-visible styles');
    }

    await context.close();
  }

  return dashboardData;
}

async function checkHomepageSections(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const sections = await page.evaluate(() => {
    const text = document.body.innerText;
    const checks = {
      navbar: !!document.querySelector('nav, header'),
      hero: !!document.querySelector('h1'),
      features: /features/i.test(text) && !!document.querySelector('#features, [id*="features"]'),
      ai: /ai|pro/i.test(text),
      pricing: /pricing|free|pro/i.test(text) && !!document.querySelector('#pricing, [id*="pricing"]'),
      cta: /get started|start free|sign up/i.test(text),
      footer: !!document.querySelector('footer'),
    };
    const sectionTexts = [...document.querySelectorAll('h2, h3')].map((h) => h.textContent?.trim());
    return { checks, sectionTexts, footerLinks: [...document.querySelectorAll('footer a')].map((a) => a.textContent?.trim()) };
  });

  const required = ['navbar', 'hero', 'features', 'ai', 'pricing', 'cta', 'footer'];
  for (const key of required) {
    if (!sections.checks[key]) {
      addIssue('homepage', 'critical', 'desktop', `Missing section: ${key}`, `Add ${key} section per homepage-spec.md`);
    }
  }

  await context.close();
  return sections;
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch({ headless: true });

  try {
    const sectionCheck = await checkHomepageSections(browser);
    const homepageData = await reviewHomepage(browser);
    const dashboardData = await reviewDashboard(browser);

    const report = { sectionCheck, homepageData, dashboardData, issues };
    await writeFile(path.join(process.cwd(), '.ui-review', 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
