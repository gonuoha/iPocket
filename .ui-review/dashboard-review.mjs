import { chromium } from 'playwright';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), '.ui-review', 'screenshots');

async function login(page) {
  await page.goto(`${BASE}/sign-in`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#email');
  await page.fill('#email', 'demo@ipocket.io');
  await page.fill('#password', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  if (!page.url().includes('/dashboard')) {
    throw new Error(`Login failed, still at ${page.url()}`);
  }
}

async function auditDashboard(page) {
  return page.evaluate(() => {
    const smallTargets = [];
    for (const el of document.querySelectorAll('a, button, [role="button"], input')) {
      const s = getComputedStyle(el);
      if (s.display === 'none' || s.visibility === 'hidden') continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.height < 44 || r.width < 44) {
        smallTargets.push({
          text: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40),
          w: Math.round(r.width),
          h: Math.round(r.height),
        });
      }
    }
    return {
      url: location.href,
      title: document.title,
      h1: document.querySelector('h1')?.textContent?.trim(),
      headings: [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent?.trim()),
      hasSidebar: !!document.querySelector('[data-sidebar], aside'),
      hasMain: !!document.querySelector('main'),
      horizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
      smallTargets: smallTargets.slice(0, 15),
      bodyPreview: document.body.innerText.slice(0, 400),
    };
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = {};

  for (const vp of [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 900 },
  ]) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await login(page);
    const audit = await auditDashboard(page);
    await page.screenshot({ path: path.join(OUT, `dashboard-${vp.name}-logged-in.png`), fullPage: false });
    await page.screenshot({ path: path.join(OUT, `dashboard-${vp.name}-full.png`), fullPage: true });
    results[vp.name] = audit;
    await context.close();
  }

  await writeFile(path.join(process.cwd(), '.ui-review', 'dashboard-report.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main();
