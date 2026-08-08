import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();

  page.on('response', async (res) => {
    if (res.url().includes('/api/auth/login')) {
      console.log('LOGIN RESPONSE', res.status(), await res.text().catch(() => ''));
    }
  });

  await page.goto(`${BASE}/sign-in`);
  await page.fill('#email', 'demo@ipocket.io');
  await page.fill('#password', '12345678');
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000);
  console.log('URL after submit:', page.url());
  console.log('Error text:', await page.locator('.text-destructive').textContent().catch(() => 'none'));
  console.log('Body:', (await page.locator('body').innerText()).slice(0, 500));
  await browser.close();
}

main();
