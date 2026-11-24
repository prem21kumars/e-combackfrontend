import { chromium } from 'playwright';

async function testOrderDetail() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
  await page.fill('input[placeholder="••••••••"]', 'Customer@123456');

  const [loginRes] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/auth/login')),
    page.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);
  console.log('Login status:', loginRes.status());
  await page.waitForTimeout(1000);

  let orderApiStatus = null;
  page.on('response', (res) => {
    if (res.url().includes('ORD-20261115-693015')) {
      orderApiStatus = res.status();
    }
  });

  await page.goto('http://localhost:5174/orders/ORD-20261115-693015', { waitUntil: 'networkidle' });
  console.log('GET /api/v1/orders/ORD-20261115-693015 HTTP status in browser:', orderApiStatus);

  const heading = await page.locator('h1').textContent();
  console.log('Heading on Order Detail Page:', heading.trim());

  await browser.close();
}

testOrderDetail();
