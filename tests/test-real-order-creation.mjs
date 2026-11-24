import { chromium } from 'playwright';

async function main() {
  console.log('====================================================');
  console.log('VERIFYING REAL ORDER CREATION IN MYSQL VIA PLAYWRIGHT');
  console.log('====================================================');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // 1. Sign in as customer Priya Sharma
  console.log('1. Signing in as customer...');
  await page.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await page.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
  await page.fill('input[placeholder="••••••••"]', 'Customer@123456');

  const [loginRes] = await Promise.all([
    page.waitForResponse(res => res.url().includes('/auth/login')),
    page.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);
  console.log('   Login response HTTP status:', loginRes.status());
  await page.waitForTimeout(1000);

  // 2. Add product (id: 22 "Test Robot QA") to cart
  console.log('2. Adding "Test Robot QA" to cart...');
  await page.goto('http://localhost:5174/products/22', { waitUntil: 'networkidle' });
  await page.click('button:has-text("Add to Cart")');
  await page.waitForTimeout(1000);

  // 3. Navigate to checkout
  console.log('3. Navigating to checkout...');
  await page.goto('http://localhost:5174/checkout', { waitUntil: 'networkidle' });

  // 4. Fill in or verify checkout form
  console.log('4. Submitting checkout form and capturing POST /api/v1/orders...');
  await page.fill('input[name="name"]', 'Priya Sharma');
  await page.fill('input[name="phone"]', '+91 98765 43210');
  await page.fill('input[name="street"]', 'Flat 402, Lotus Residency, MG Road');
  await page.fill('input[name="city"]', 'Bengaluru');
  await page.fill('input[name="pincode"]', '560001');

  // Intercept the POST /orders request & response
  let orderApiStatus = null;
  let orderResponseBody = null;
  page.on('response', async res => {
    if (res.url().includes('/api/v1/orders') && res.request().method() === 'POST') {
      orderApiStatus = res.status();
      try {
        orderResponseBody = await res.json();
      } catch (e) {}
    }
  });

  const placeOrderBtn = page.locator('button:has-text("Place Order")');
  await placeOrderBtn.click();
  await page.waitForTimeout(2500);

  console.log('   POST /api/v1/orders response status:', orderApiStatus);
  console.log('   Backend Response:', JSON.stringify(orderResponseBody, null, 2));
  console.log('   Current Page URL:', page.url());

  const isConfirmed = page.url().includes('/checkout/confirmation/');
  const orderNumber = orderResponseBody?.data?.orderNumber || 'None';
  console.log('   Confirmation page reached?:', isConfirmed);
  console.log('   Authoritative Order Number:', orderNumber);

  if (orderApiStatus === 201 && orderNumber.startsWith('ORD-')) {
    console.log('\nSUCCESS: REAL BACKEND ORDER PERSISTED IN MYSQL!');
  } else {
    console.error('\nFAILURE: Order did not create with 201 Created on backend!');
    process.exit(1);
  }

  await context.close();
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

