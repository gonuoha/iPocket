import { chromium } from 'playwright';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = path.join(process.cwd(), '.ui-review', 'screenshots');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const beforeScroll = await page.evaluate(() => {
    const sections = ['features', 'ai', 'pricing'];
    return sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const s = getComputedStyle(el.closest('[data-visible]') || el);
      return {
        id,
        found: true,
        opacity: s.opacity,
        visible: el.closest('[data-visible]')?.getAttribute('data-visible'),
        height: el.getBoundingClientRect().height,
      };
    });
  });

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);

  const afterScroll = await page.evaluate(() => {
    const sections = ['features', 'ai', 'pricing'];
    return sections.map((id) => {
      const el = document.getElementById(id);
      const wrapper = el?.closest('[data-visible]');
      const s = getComputedStyle(wrapper || el);
      return {
        id,
        opacity: s.opacity,
        visible: wrapper?.getAttribute('data-visible'),
        text: el?.querySelector('h2,h3')?.textContent?.trim(),
      };
    });
  });

  await page.screenshot({ path: path.join(OUT, 'homepage-scrolled-full.png'), fullPage: true });

  const socialProof = await page.evaluate(() => {
    const text = document.body.innerText.toLowerCase();
    return {
      hasTestimonials: /testimonial|review|trusted by|used by|customers/i.test(text),
      hasStats: /\d+\+?\s*(users|developers|items|snippets)/i.test(text),
      copyright: document.querySelector('footer')?.innerText.match(/©\s*\d{4}/)?.[0],
    };
  });

  console.log(JSON.stringify({ beforeScroll, afterScroll, socialProof }, null, 2));
  await browser.close();
}

main();
