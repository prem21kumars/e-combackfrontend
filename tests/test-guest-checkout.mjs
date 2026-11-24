import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });

  console.log('--- TEST 1: GUEST ATTEMPT TO CHECKOUT ---');
  const guestContext = await browser.newContext();
  const guestPage = await guestContext.newPage();

  // Add product to cart
  await guestPage.goto('http://localhost:5174/products/1', { waitUntil: 'networkidle' });
  await guestPage.click('button:has-text("Add to Cart")');
  await guestPage.waitForTimeout(500);

  // Visit cart
  await guestPage.goto('http://localhost:5174/cart', { waitUntil: 'networkidle' });
  const checkoutBtnText = await guestPage.locator('button:has-text("to Checkout")').innerText();
  console.log('Cart checkout button text (guest):', checkoutBtnText.trim());

  // Click proceed
  await guestPage.click('button:has-text("to Checkout")');
  await guestPage.waitForTimeout(1000);
  console.log('URL after clicking checkout as guest:', guestPage.url());

  // Directly attempt to access /checkout
  await guestPage.goto('http://localhost:5174/checkout', { waitUntil: 'networkidle' });
  const gateTitle = await guestPage.locator('h3:has-text("Customer Sign In Required")').isVisible();
  console.log('Guest blocked by Sign In Required gate:', gateTitle);
  const placeOrderBtnVisible = await guestPage.locator('button:has-text("Place Order")').isVisible();
  console.log('Can guest see "Place Order" button?:', placeOrderBtnVisible);

  await guestContext.close();

  console.log('\n--- TEST 2: AUTHENTICATED CUSTOMER CHECKOUT ---');
  const authContext = await browser.newContext();
  const authPage = await authContext.newPage();

  await authPage.goto('http://localhost:5174/login', { waitUntil: 'networkidle' });
  await authPage.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
  await authPage.fill('input[placeholder="••••••••"]', 'Customer@123456');

  const [response] = await Promise.all([
    authPage.waitForResponse(res => res.url().includes('/auth/login')),
    authPage.getByRole('button', { name: 'Sign In', exact: true }).click(),
  ]);
  console.log('Customer login API status:', response.status());
  await authPage.waitForTimeout(1500);

  await authPage.goto('http://localhost:5174/products/1', { waitUntil: 'networkidle' });
  await authPage.click('button:has-text("Add to Cart")');
  await authPage.waitForTimeout(500);

  await authPage.goto('http://localhost:5174/checkout', { waitUntil: 'networkidle' });
  const authGateVisible = await authPage.locator('h3:has-text("Customer Sign In Required")').isVisible();
  console.log('Is authenticated customer blocked by gate?:', authGateVisible);
  const authPlaceOrderBtn = await authPage.locator('button:has-text("Place Order")').isVisible();
  console.log('Can authenticated customer see "Place Order" button?:', authPlaceOrderBtn);

  await authContext.close();
  await browser.close();
}

main().catch(console.error);

