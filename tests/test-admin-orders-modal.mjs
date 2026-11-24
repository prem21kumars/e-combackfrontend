import { chromium } from 'playwright';

async function testSpecificOrderModal() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="parent@example.com"]', 'admin@ootoys.com');
  await page.fill('input[placeholder="••••••••"]', 'Admin@123456');

  await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/login')),
    page.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);
  await page.waitForTimeout(1000);

  await page.goto('http://localhost:5174/admin/orders', { waitUntil: 'networkidle' });

  // Search for ORD-20261114-264433
  await page.fill('input[placeholder*="Search by Order ID"]', 'ORD-20261114-264433');
  await page.waitForTimeout(500);

  const targetRow = page.locator('tbody tr:first-child');
  const eyeBtn = targetRow.locator('button[title="View Full Order Breakdown"]');
  await eyeBtn.click();
  await page.waitForTimeout(1000);

  const modal = page.locator('div.position-fixed');
  const header = await modal.locator('h5').textContent();
  console.log('Target Order Modal Header:', header.trim());

  const info = await modal.locator('.bg-light').textContent();
  console.log('Target Order Info:\n', info.replace(/\s+/g, ' ').trim());

  const items = await modal.locator('h6:has-text("Ordered Toys:") + div > div').allTextContents();
  console.log('Target Order Items:\n', items.map(s => s.replace(/\s+/g, ' ').trim()));

  const total = await modal.locator('span.text-primary').last().textContent();
  console.log('Target Order Total:', total.trim());

  await browser.close();
}

testSpecificOrderModal();
