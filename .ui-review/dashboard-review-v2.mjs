import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), '.ui-review', 'screenshots');

async function auditPage(page) {
  return page.evaluate(() => {
    const smallTargets = [];
    for (const el of document.querySelectorAll('a, button, [role="button"], input, [data-sidebar] button')) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) continue;
      if (r.height < 44 || r.width < 44) {
        smallTargets.push({
          text: (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || el.tagName).trim().slice(0, 50),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }

    const sidebar = document.querySelector('[data-sidebar], aside');
    const sidebarRect = sidebar?.getBoundingClientRect();
    const main = document.querySelector('main');
    const mainRect = main?.getBoundingClientRect();

    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim(),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent?.trim()),
      hasSidebar: !!sidebar,
      sidebarVisible: sidebarRect ? sidebarRect.width > 0 && sidebarRect.left >= 0 : false,
      sidebarWidth: sidebarRect?.width,
      mainLeft: mainRect?.left,
      horizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
      smallTargets: smallTargets.slice(0, 20),
      imgsNoAlt: [...document.querySelectorAll('img')].filter((i) => i.getAttribute('alt') === null).length,
      hasSkipLink: !!document.querySelector('a[href="#main"], a[href="#content"]'),
      hasMain: !!main,
      bodyPreview: document.body.innerText.replace(/\s+/g, ' ').slice(0, 500),
    };
  });
}

async function testFocus(page) {
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const el = document.activeElement;
    const s = el ? getComputedStyle(el) : null;
    return {
      tag: el?.tagName,
      text: el?.textContent?.trim().slice(0, 30),
      outline: s?.outline,
      boxShadow: s?.boxShadow,
      visible: !!(s && (s.outline !== 'none' || s.boxShadow !== 'none' || el?.matches(':focus-visible'))),
    };
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/sign-in`);
  await page.fill('#email', 'demo@ipocket.io');
  await page.fill('#password', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 45000 });
  await page.waitForTimeout(2000);

  const results = {};
  for (const vp of [
    { name: 'desktop', width: 1280, height: 900 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'mobile', width: 375, height: 812 },
  ]) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(500);
    results[vp.name] = {
      audit: await auditPage(page),
      focus: await testFocus(page),
    };
    await page.screenshot({ path: path.join(OUT, `dashboard-${vp.name}-v2.png`) });
  }

  await writeFile(path.join(process.cwd(), '.ui-review', 'dashboard-report-v2.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
