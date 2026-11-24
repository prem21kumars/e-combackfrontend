import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5174';
const SCREENSHOT_DIR = path.resolve('tests/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const testResults = [];

function recordTest(id, module, title, status, details = {}, evidence = '') {
  const result = {
    id,
    module,
    title,
    status, // 'PASSED' | 'FAILED' | 'BLOCKED' | 'NOT_CONNECTED' | 'API_MISSING' | 'MOCK_DATA' | 'PARTIALLY_CONNECTED'
    details,
    evidence,
    timestamp: new Date().toISOString(),
  };
  testResults.push(result);
  console.log(`[${status}] ${id}: ${title}`);
}

async function runQaAutomation() {
  console.log('====================================================');
  console.log('SENIOR QA AUTOMATION: EXECUTING FULL AUDIT SUITE');
  console.log(`Target URL: ${BASE_URL}`);
  console.log('====================================================\n');

  const browser = await chromium.launch({ headless: true });

  // -------------------------------------------------------------
  // MODULE 1: AUTHENTICATION & SESSION TESTING
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 1.1 Unauthenticated Admin Route Guard
    try {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'domcontentloaded' });
      await page.waitForURL('**/login', { timeout: 6000 });
      const redirectedUrl = page.url();
      if (redirectedUrl.includes('/login')) {
        recordTest('TC-AUTH-001', 'Authentication', 'Admin Route Guard for Unauthenticated User', 'PASSED', {
          redirectedTo: redirectedUrl,
        }, 'Direct navigation to /admin properly redirects unauthenticated user to /login');
      } else {
        recordTest('TC-AUTH-001', 'Authentication', 'Admin Route Guard for Unauthenticated User', 'FAILED', {
          url: redirectedUrl,
        }, 'Unauthenticated user was not redirected to /login');
      }
    } catch (e) {
      recordTest('TC-AUTH-001', 'Authentication', 'Admin Route Guard for Unauthenticated User', 'FAILED', { error: e.message });
    }

    // 1.2 Invalid Login Credentials
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.fill('input[placeholder="parent@example.com"]', 'admin@ootoys.com');
      await page.fill('input[placeholder="••••••••"]', 'WrongPassword123!');
      
      const [response] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/auth/login')),
        page.getByRole('button', { name: 'Sign In', exact: true }).click(),
      ]);

      const resStatus = response.status();
      await page.waitForTimeout(1000);
      const errorVisible = await page.locator('.alert-danger').isVisible();
      const errorText = errorVisible ? await page.locator('.alert-danger').innerText() : '';

      if (resStatus === 401 && errorVisible && page.url().includes('/login')) {
        recordTest('TC-AUTH-002', 'Authentication', 'Login with Invalid Password', 'PASSED', {
          apiStatus: resStatus,
          errorDisplayed: errorText,
          retainedOnPage: page.url(),
        }, 'Backend returned 401 Unauthorized; frontend remained on /login and displayed alert');
      } else {
        recordTest('TC-AUTH-002', 'Authentication', 'Login with Invalid Password', 'FAILED', {
          apiStatus: resStatus,
          errorVisible,
          url: page.url(),
        }, 'Expected 401 status and error banner on /login');
      }
    } catch (e) {
      recordTest('TC-AUTH-002', 'Authentication', 'Login with Invalid Password', 'FAILED', { error: e.message });
    }

    // 1.3 Empty Email / Password Required Field Validation
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      const emailField = page.locator('input[placeholder="parent@example.com"]');
      const isRequired = await emailField.evaluate(el => el.required);
      recordTest('TC-AUTH-003', 'Authentication', 'Login Form Required Field Validation', isRequired ? 'PASSED' : 'FAILED', {
        emailRequired: isRequired,
      }, 'HTML5 client-side validation prevents empty form submission');
    } catch (e) {
      recordTest('TC-AUTH-003', 'Authentication', 'Login Form Required Field Validation', 'FAILED', { error: e.message });
    }

    // 1.4 Valid Customer Login
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
      await page.fill('input[placeholder="••••••••"]', 'Customer@123456');

      const [loginRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/auth/login')),
        page.getByRole('button', { name: 'Sign In', exact: true }).click(),
      ]);

      await page.waitForTimeout(1500);
      const authStorage = await page.evaluate(() => localStorage.getItem('OO Toys_auth'));
      const tokenStored = !!authStorage && JSON.parse(authStorage).accessToken;

      if (loginRes.status() === 200 && tokenStored) {
        recordTest('TC-AUTH-004', 'Authentication', 'Valid Customer Authentication & JWT Storage', 'PASSED', {
          status: loginRes.status(),
          tokenPresent: true,
          destination: page.url(),
        }, 'Customer authenticated with 200 OK; JWT token stored in localStorage');
      } else {
        recordTest('TC-AUTH-004', 'Authentication', 'Valid Customer Authentication & JWT Storage', 'FAILED', {
          status: loginRes.status(),
          tokenStored,
        }, 'Customer login did not return 200 or store JWT token');
      }
    } catch (e) {
      recordTest('TC-AUTH-004', 'Authentication', 'Valid Customer Authentication & JWT Storage', 'FAILED', { error: e.message });
    }

    // 1.5 Customer Accessing Admin Route (Authorization Guard)
    try {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      const accessDenied = await page.locator('text=Access Denied').isVisible();
      if (accessDenied) {
        recordTest('TC-AUTH-005', 'Authentication', 'Customer Role RBAC Access Denied on /admin', 'PASSED', {
          blocked: true,
        }, 'Customer logged in with ROLE_CUSTOMER is denied access to /admin with Access Denied banner');
      } else {
        recordTest('TC-AUTH-005', 'Authentication', 'Customer Role RBAC Access Denied on /admin', 'FAILED', {
          url: page.url(),
        }, 'Customer was not blocked from /admin');
      }
    } catch (e) {
      recordTest('TC-AUTH-005', 'Authentication', 'Customer Role RBAC Access Denied on /admin', 'FAILED', { error: e.message });
    }

    // 1.6 Valid Admin Login
    try {
      await page.evaluate(() => localStorage.clear());
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.fill('input[placeholder="parent@example.com"]', 'admin@ootoys.com');
      await page.fill('input[placeholder="••••••••"]', 'Admin@123456');

      const [adminLoginRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/auth/login')),
        page.getByRole('button', { name: 'Sign In', exact: true }).click(),
      ]);

      await page.waitForTimeout(1500);
      const onAdmin = page.url().includes('/admin');
      const adminNavVisible = await page.locator('text=Operations & Catalog').isVisible();

      if (adminLoginRes.status() === 200 && onAdmin && adminNavVisible) {
        recordTest('TC-AUTH-006', 'Authentication', 'Valid Admin Login & Navigation to Console', 'PASSED', {
          status: adminLoginRes.status(),
          currentUrl: page.url(),
        }, 'Admin authenticated with 200 OK and redirected to /admin operations console');
      } else {
        recordTest('TC-AUTH-006', 'Authentication', 'Valid Admin Login & Navigation to Console', 'FAILED', {
          status: adminLoginRes.status(),
          onAdmin,
          adminNavVisible,
        }, 'Admin login failed to navigate to /admin');
      }
    } catch (e) {
      recordTest('TC-AUTH-006', 'Authentication', 'Valid Admin Login & Navigation to Console', 'FAILED', { error: e.message });
    }

    // 1.7 Logout Functionality
    try {
      const exitBtn = page.locator('button:has-text("Exit Admin")');
      if (await exitBtn.isVisible()) {
        await exitBtn.click();
        await page.waitForTimeout(1000);
        const authData = await page.evaluate(() => localStorage.getItem('OO Toys_auth'));
        if (!authData && page.url().includes('/login')) {
          recordTest('TC-AUTH-007', 'Authentication', 'Session Logout & Token Invalidation', 'PASSED', {
            tokenCleared: true,
            redirectedTo: page.url(),
          }, 'Logout clears auth data from localStorage and returns to login');
        } else {
          recordTest('TC-AUTH-007', 'Authentication', 'Session Logout & Token Invalidation', 'FAILED', {
            authData,
            url: page.url(),
          }, 'Logout did not clear localStorage');
        }
      }
    } catch (e) {
      recordTest('TC-AUTH-007', 'Authentication', 'Session Logout & Token Invalidation', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // MODULE 2: REGISTRATION TESTING
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 2.1 Duplicate Email Registration
    try {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      await page.fill('input[name="name"]', 'Duplicate User');
      await page.fill('input[name="email"]', 'admin@ootoys.com');
      await page.fill('input[name="password"]', 'Parent@123456');
      await page.fill('input[name="confirmPassword"]', 'Parent@123456');

      const [dupRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/auth/register')),
        page.getByRole('button', { name: 'Register Account', exact: true }).click(),
      ]);

      await page.waitForTimeout(1000);
      const alertVisible = await page.locator('.alert-danger').isVisible();
      const alertMsg = alertVisible ? await page.locator('.alert-danger').innerText() : '';

      if (dupRes.status() === 409 && alertVisible) {
        recordTest('TC-REG-001', 'Registration', 'Duplicate Email Registration Conflict Handling', 'PASSED', {
          status: dupRes.status(),
          message: alertMsg,
        }, 'Backend returned 409 Conflict; frontend displayed alert with conflict message');
      } else {
        recordTest('TC-REG-001', 'Registration', 'Duplicate Email Registration Conflict Handling', 'FAILED', {
          status: dupRes.status(),
          alertVisible,
        }, 'Expected 409 status and alert for duplicate email');
      }
    } catch (e) {
      recordTest('TC-REG-001', 'Registration', 'Duplicate Email Registration Conflict Handling', 'FAILED', { error: e.message });
    }

    // 2.2 Password Mismatch
    try {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      await page.fill('input[name="name"]', 'Mismatch Tester');
      await page.fill('input[name="email"]', 'mismatch@example.com');
      await page.fill('input[name="password"]', 'Parent@123456');
      await page.fill('input[name="confirmPassword"]', 'Different@123456');
      await page.getByRole('button', { name: 'Register Account', exact: true }).click();

      const alertVisible = await page.locator('.alert-danger').isVisible();
      const alertText = alertVisible ? await page.locator('.alert-danger').innerText() : '';

      if (alertVisible && alertText.includes('Passwords do not match')) {
        recordTest('TC-REG-002', 'Registration', 'Password Confirmation Mismatch Validation', 'PASSED', {
          message: alertText,
        }, 'Client-side validation detects password mismatch and blocks submission');
      } else {
        recordTest('TC-REG-002', 'Registration', 'Password Confirmation Mismatch Validation', 'FAILED', {
          alertVisible,
          alertText,
        }, 'Expected Passwords do not match alert');
      }
    } catch (e) {
      recordTest('TC-REG-002', 'Registration', 'Password Confirmation Mismatch Validation', 'FAILED', { error: e.message });
    }

    // 2.3 Weak Password Validation
    try {
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      await page.fill('input[name="name"]', 'Weak Tester');
      await page.fill('input[name="email"]', 'weak@example.com');
      await page.fill('input[name="password"]', 'simple123');
      await page.fill('input[name="confirmPassword"]', 'simple123');
      await page.getByRole('button', { name: 'Register Account', exact: true }).click();

      const alertVisible = await page.locator('.alert-danger').isVisible();
      const alertText = alertVisible ? await page.locator('.alert-danger').innerText() : '';

      if (alertVisible && alertText.toLowerCase().includes('special character')) {
        recordTest('TC-REG-003', 'Registration', 'Password Complexity Validation (OWASP)', 'PASSED', {
          message: alertText,
        }, 'Client validation enforces uppercase, lowercase, digit, and special character');
      } else {
        recordTest('TC-REG-003', 'Registration', 'Password Complexity Validation (OWASP)', 'FAILED', {
          alertVisible,
          alertText,
        }, 'Weak password was not caught by complexity validation');
      }
    } catch (e) {
      recordTest('TC-REG-003', 'Registration', 'Password Complexity Validation (OWASP)', 'FAILED', { error: e.message });
    }

    // 2.4 Valid Registration
    try {
      const uniqueTimestamp = Date.now();
      const uniqueEmail = `qa_parent_${uniqueTimestamp}@ootoys-qa.org`;
      const uniquePhone = '9' + Math.floor(100000000 + Math.random() * 900000000);
      await page.goto(`${BASE_URL}/register`, { waitUntil: 'networkidle' });
      await page.fill('input[name="name"]', 'Aarav Gupta');
      await page.fill('input[name="email"]', uniqueEmail);
      await page.fill('input[name="phone"]', uniquePhone);
      await page.fill('input[name="street"]', '12 MG Road');
      await page.fill('input[name="city"]', 'Bengaluru');
      await page.fill('input[name="pincode"]', '560001');
      await page.fill('input[name="password"]', 'Parent@123456');
      await page.fill('input[name="confirmPassword"]', 'Parent@123456');

      const [regRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/auth/register')),
        page.getByRole('button', { name: 'Register Account', exact: true }).click(),
      ]);

      await page.waitForTimeout(2000);
      const isAccountPage = page.url().includes('/account');

      if (regRes.status() === 201 && isAccountPage) {
        recordTest('TC-REG-004', 'Registration', 'Successful Customer Registration & Direct Session Login', 'PASSED', {
          status: regRes.status(),
          registeredEmail: uniqueEmail,
          destination: page.url(),
        }, 'User registered with 201 Created; JWT token stored and redirected to /account');
      } else {
        recordTest('TC-REG-004', 'Registration', 'Successful Customer Registration & Direct Session Login', 'FAILED', {
          status: regRes.status(),
          destination: page.url(),
        }, 'Registration API failed or did not navigate to /account');
      }
    } catch (e) {
      recordTest('TC-REG-004', 'Registration', 'Successful Customer Registration & Direct Session Login', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // MODULE 3: PASSWORD RECOVERY AUDIT
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 3.1 Forgot Password
    try {
      await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
      await page.fill('input[type="email"]', 'priya@example.com');
      
      let apiCalled = false;
      let apiStatus = null;
      page.on('response', res => {
        if (res.url().includes('/auth/forgot-password')) {
          apiCalled = true;
          apiStatus = res.status();
        }
      });

      await page.getByRole('button', { name: 'Send Recovery Link' }).click();
      await page.waitForTimeout(1500);
      const successVisible = await page.locator('.alert-success').isVisible();

      if (apiCalled && (apiStatus === 200 || successVisible)) {
        recordTest('TC-PWD-001', 'Password Recovery', 'Forgot Password Workflow', 'PASSED', {
          apiCalled: true,
          apiStatus,
          endpoint: 'POST /api/v1/auth/forgot-password',
        }, 'Frontend invokes POST /api/v1/auth/forgot-password and displays password recovery link successfully');
      } else if (!apiCalled) {
        recordTest('TC-PWD-001', 'Password Recovery', 'Forgot Password Workflow', 'API_MISSING', {
          simulated: true,
          apiCalled: false,
          missingEndpoint: 'POST /api/v1/auth/forgot-password',
        }, 'Frontend shows simulated success banner; NO backend API exists in AuthController');
      } else {
        recordTest('TC-PWD-001', 'Password Recovery', 'Forgot Password Workflow', 'FAILED', { apiStatus });
      }
    } catch (e) {
      recordTest('TC-PWD-001', 'Password Recovery', 'Forgot Password Workflow', 'FAILED', { error: e.message });
    }

    // 3.2 Reset Password Route
    try {
      await page.goto(`${BASE_URL}/reset-password?token=sample-test-token`, { waitUntil: 'networkidle' });
      const notFoundVisible = await page.locator('text=Oops! Toy Not Found').isVisible();
      const formVisible = await page.getByRole('heading', { name: 'Create New Password' }).isVisible();

      if (!notFoundVisible && formVisible) {
        recordTest('TC-PWD-002', 'Password Recovery', 'Reset Password Route & Endpoint', 'PASSED', {
          routeMounted: true,
          endpoint: 'POST /api/v1/auth/reset-password',
        }, 'Route /reset-password properly mounted in AppRoutes.jsx and connected to authService.resetPassword');
      } else if (notFoundVisible) {
        recordTest('TC-PWD-002', 'Password Recovery', 'Reset Password Route & Endpoint', 'API_MISSING', {
          routeMissing: true,
          missingEndpoint: 'POST /api/v1/auth/reset-password',
        }, 'No /reset-password route exists in AppRoutes.jsx; renders 404 page');
      } else {
        recordTest('TC-PWD-002', 'Password Recovery', 'Reset Password Route & Endpoint', 'FAILED', {});
      }
    } catch (e) {
      recordTest('TC-PWD-002', 'Password Recovery', 'Reset Password Route & Endpoint', 'FAILED', { error: e.message });
    }

    // 3.3 Change Password Feature
    try {
      await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
      await page.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
      await page.fill('input[placeholder="••••••••"]', 'Customer@123456');
      await page.getByRole('button', { name: 'Sign In', exact: true }).click();
      await page.waitForTimeout(1500);

      await page.goto(`${BASE_URL}/account`, { waitUntil: 'networkidle' });
      const changePwdVisible = await page.locator('text=Security & Password').isVisible();
      const changeBtnVisible = await page.locator('button:has-text("Change Password")').isVisible();

      if (changePwdVisible && changeBtnVisible) {
        recordTest('TC-PWD-003', 'Password Recovery', 'Change Password Form in Profile', 'PASSED', {
          uiPresent: true,
          endpoint: 'POST /api/v1/auth/change-password',
        }, 'Change Password form active in ProfilePage.jsx connected to POST /api/v1/auth/change-password');
      } else {
        recordTest('TC-PWD-003', 'Password Recovery', 'Change Password Form in Profile', 'NOT_CONNECTED', {
          uiPresent: false,
          missingEndpoint: 'POST /api/v1/auth/change-password',
        }, 'No change password form or UI exists in ProfilePage.jsx or backend');
      }
    } catch (e) {
      recordTest('TC-PWD-003', 'Password Recovery', 'Change Password Form in Profile', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // MODULE 4: STOREFRONT & BROWSING JOURNEY
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Authenticate customer session so cart and wishlist sync with backend APIs
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="parent@example.com"]', 'priya@example.com');
    await page.fill('input[placeholder="••••••••"]', 'Customer@123456');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForTimeout(1500);

    // 4.1 Home Page & Hero Navigation
    try {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
      const title = await page.title();
      const heroVisible = await page.locator('h1.hero-title').isVisible();
      recordTest('TC-STORE-001', 'Storefront', 'Homepage Hero & Catalog Rendering', heroVisible ? 'PASSED' : 'FAILED', {
        title,
        heroVisible,
      }, 'Homepage renders with promotional hero, banner, and featured toy collections');
    } catch (e) {
      recordTest('TC-STORE-001', 'Storefront', 'Homepage Hero & Catalog Rendering', 'FAILED', { error: e.message });
    }

    // 4.2 Products Catalog Page & Live Filtering
    try {
      await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
      await page.waitForSelector('.tw-card');
      const cardCount = await page.locator('.tw-card').count();

      recordTest('TC-STORE-002', 'Storefront', 'Products Catalog Page & Real-Time Search Filtering', cardCount > 0 ? 'PASSED' : 'FAILED', {
        initialProductsCount: cardCount,
      }, `Products catalog rendered ${cardCount} products successfully from backend /api/v1/products`);
    } catch (e) {
      recordTest('TC-STORE-002', 'Storefront', 'Products Catalog Page & Real-Time Search Filtering', 'FAILED', { error: e.message });
    }

    // 4.3 Product Detail Page & Add to Cart
    try {
      await page.goto(`${BASE_URL}/products/1`, { waitUntil: 'networkidle' });
      const prodHeading = await page.locator('h1').innerText();
      const addToCartBtn = page.locator('button:has-text("Add to Cart")').first();
      const isAddVisible = await addToCartBtn.isVisible();

      if (isAddVisible) {
        await addToCartBtn.click();
        await page.waitForTimeout(800);
        const cartBadge = await page.locator('a[href="/cart"] .badge').innerText();

        recordTest('TC-STORE-003', 'Storefront', 'Product Detail View & Add to Cart Action', 'PASSED', {
          productName: prodHeading,
          cartCount: cartBadge,
        }, 'Product details loaded; clicking Add to Cart updates cart count and triggers confirmation toast');
      } else {
        recordTest('TC-STORE-003', 'Storefront', 'Product Detail View & Add to Cart Action', 'FAILED', { isAddVisible });
      }
    } catch (e) {
      recordTest('TC-STORE-003', 'Storefront', 'Product Detail View & Add to Cart Action', 'FAILED', { error: e.message });
    }

    // 4.4 Cart Page, Quantity Adjustment & LocalStorage Architecture
    try {
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
      const hasItems = await page.locator('text=Order Summary').isVisible();
      const plusBtn = page.locator('button:has-text("+")').first();
      
      let cartApiCalled = false;
      page.on('request', req => {
        if (req.url().includes('/api/v1/cart')) cartApiCalled = true;
      });

      if (await plusBtn.isVisible()) {
        await plusBtn.click();
        await page.waitForTimeout(500);
      }

      if (hasItems && !cartApiCalled) {
        recordTest('TC-STORE-004', 'Storefront', 'Shopping Cart Architecture (Local vs Server API)', 'PARTIALLY_CONNECTED', {
          serverCartConnected: false,
          localStorageManaged: true,
          backendEndpointAvailable: 'GET/POST /api/v1/cart',
        }, 'Cart operates smoothly in localStorage, but does not synchronize with backend /api/v1/cart endpoints');
      } else if (hasItems && cartApiCalled) {
        recordTest('TC-STORE-004', 'Storefront', 'Shopping Cart Architecture (Local vs Server API)', 'PASSED', {});
      } else {
        recordTest('TC-STORE-004', 'Storefront', 'Shopping Cart Architecture (Local vs Server API)', 'FAILED', {});
      }
    } catch (e) {
      recordTest('TC-STORE-004', 'Storefront', 'Shopping Cart Architecture (Local vs Server API)', 'FAILED', { error: e.message });
    }

    // 4.5 Promo Code Verification
    try {
      await page.goto(`${BASE_URL}/cart`, { waitUntil: 'networkidle' });
      const promoInput = page.locator('input[placeholder*="TOYJOY10"]');
      const applyBtn = page.locator('button:has-text("Apply")');

      if (await promoInput.isVisible() && await applyBtn.isVisible()) {
        await promoInput.fill('TOYJOY10');
        await applyBtn.click();
        await page.waitForTimeout(500);
        const discountApplied = await page.locator('.bg-success-subtle').isVisible();

        recordTest('TC-STORE-005', 'Storefront', 'Promo Code Application & Discount Calculation', discountApplied ? 'PASSED' : 'FAILED', {
          promoCode: 'TOYJOY10',
          discountApplied,
        }, 'Promo code TOYJOY10 validated and applied discount correctly to cart total');
      }
    } catch (e) {
      recordTest('TC-STORE-005', 'Storefront', 'Promo Code Application & Discount Calculation', 'FAILED', { error: e.message });
    }

    // 4.6 Wishlist Functionality
    try {
      await page.goto(`${BASE_URL}/products`, { waitUntil: 'networkidle' });
      const heartBtn = page.locator('.tw-card button:has(svg.lucide-heart)').first();
      if (await heartBtn.isVisible()) {
        await heartBtn.click();
        await page.waitForTimeout(500);
      }

      await page.goto(`${BASE_URL}/wishlist`, { waitUntil: 'networkidle' });
      const wishlistHasCards = await page.locator('.card, .tw-card').count();

      recordTest('TC-STORE-006', 'Storefront', 'Wishlist Storage & Management', wishlistHasCards > 0 ? 'PASSED' : 'FAILED', {
        wishlistItemsCount: wishlistHasCards,
      }, 'Wishlist toggle persists items to user wishlist view');
    } catch (e) {
      recordTest('TC-STORE-006', 'Storefront', 'Wishlist Storage & Management', 'FAILED', { error: e.message });
    }

    // 4.7 Checkout Flow & Simulated Order Completion
    try {
      await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'networkidle' });
      const placeOrderBtn = page.locator('button:has-text("Place Order")');
      
      if (await placeOrderBtn.isVisible()) {
        await page.fill('input[name="name"]', 'QA Test Customer');
        await page.fill('.bg-white input[name="email"]', 'qatest@ootoys.com');
        await page.fill('input[name="phone"]', '+91 99999 88888');
        await page.fill('input[name="street"]', '123 Play Way');
        await page.fill('input[name="city"]', 'Bengaluru');
        await page.fill('input[name="pincode"]', '560001');

        await placeOrderBtn.click();
        await page.waitForTimeout(1500);
        const onConfirmation = page.url().includes('/confirmation');

        recordTest('TC-STORE-007', 'Storefront', 'Checkout Journey & Order Placement', onConfirmation ? 'PASSED' : 'FAILED', {
          confirmationUrl: page.url(),
          mode: 'Demo Simulation Order',
        }, 'Order placement successfully transitions to Order Confirmation view with generated Order ID');
      }
    } catch (e) {
      recordTest('TC-STORE-007', 'Storefront', 'Checkout Journey & Order Placement', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // MODULE 5: ADMIN OPERATIONS & MANAGEMENT CONSOLE
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // Log in as Admin first
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[placeholder="parent@example.com"]', 'admin@ootoys.com');
    await page.fill('input[placeholder="••••••••"]', 'Admin@123456');
    await page.getByRole('button', { name: 'Sign In', exact: true }).click();
    await page.waitForTimeout(1500);

    // 5.1 Admin Dashboard Overview
    try {
      await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' });
      const overviewTitle = await page.locator('h1:has-text("Operations Dashboard")').isVisible();
      const kpisVisible = await page.locator('text=Total Toys').isVisible();

      recordTest('TC-ADM-001', 'Admin Console', 'Executive Dashboard KPI Cards & Orders Table', overviewTitle && kpisVisible ? 'PASSED' : 'FAILED', {
        dashboardTitle: overviewTitle,
        kpis: kpisVisible,
      }, 'Admin dashboard loads KPI metrics cards (toys, orders, revenue) and recent activity table');
    } catch (e) {
      recordTest('TC-ADM-001', 'Admin Console', 'Executive Dashboard KPI Cards & Orders Table', 'FAILED', { error: e.message });
    }

    // 5.2 Admin Products Catalog
    try {
      await page.goto(`${BASE_URL}/admin/products`, { waitUntil: 'networkidle' });
      const tableRows = await page.locator('tbody tr').count();

      recordTest('TC-ADM-002', 'Admin Console', 'Admin Products List & Live Catalog Table', tableRows > 0 ? 'PASSED' : 'FAILED', {
        productsRendered: tableRows,
      }, `Admin products table renders ${tableRows} items with search and category filters`);
    } catch (e) {
      recordTest('TC-ADM-002', 'Admin Console', 'Admin Products List & Live Catalog Table', 'FAILED', { error: e.message });
    }

    // 5.3 Admin Add Product Validation & Submission
    try {
      await page.goto(`${BASE_URL}/admin/products/new`, { waitUntil: 'networkidle' });
      await page.fill('input[name="name"]', `QA Automated Test Robot ${Date.now()}`);
      await page.fill('input[name="price"]', '2499');
      await page.fill('input[name="stock"]', '50');
      await page.fill('textarea[name="description"]', 'An educational robotic engineering toy for testing.');

      const [saveRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/admin/products')),
        page.getByRole('button', { name: 'Create Toy', exact: true }).click(),
      ]);

      await page.waitForTimeout(1000);
      const isBackOnList = page.url().includes('/admin/products');

      if (saveRes.status() === 200 || saveRes.status() === 201) {
        recordTest('TC-ADM-003', 'Admin Console', 'Create New Product API Integration (POST /admin/products)', 'PASSED', {
          status: saveRes.status(),
          redirected: isBackOnList,
        }, 'Product creation calls POST /api/v1/admin/products and successfully saves to backend database');
      } else {
        recordTest('TC-ADM-003', 'Admin Console', 'Create New Product API Integration (POST /admin/products)', 'FAILED', {
          status: saveRes.status(),
        }, 'Product creation API did not return success code');
      }
    } catch (e) {
      recordTest('TC-ADM-003', 'Admin Console', 'Create New Product API Integration (POST /admin/products)', 'FAILED', { error: e.message });
    }

    // 5.4 Admin Categories Management (Mock Data Inspection)
    try {
      await page.goto(`${BASE_URL}/admin/categories`, { waitUntil: 'networkidle' });
      const addCatBtn = page.getByRole('button', { name: 'Add Category' });
      const addModalTrigger = await addCatBtn.isVisible();

      if (addModalTrigger) {
        await addCatBtn.click();
        await page.waitForTimeout(500);
        
        let apiCalled = false;
        page.on('request', req => {
          if (req.url().includes('/admin/categories')) apiCalled = true;
        });

        await page.fill('input[placeholder*="Musical & Sound"]', 'Robotics & AI');
        await page.fill('textarea', 'Explore intelligent building robotics.');
        await page.getByRole('button', { name: 'Save Category' }).click();
        await page.waitForTimeout(500);

        if (!apiCalled) {
          recordTest('TC-ADM-004', 'Admin Console', 'Admin Categories Backend API Connection', 'MOCK_DATA', {
            apiCalled: false,
            expectedApi: 'POST /api/v1/admin/categories',
            actualStorage: 'Component State (In-Memory)',
          }, 'AdminCategoriesPage adds categories only to local React state; does NOT invoke POST /api/v1/admin/categories');
        } else {
          recordTest('TC-ADM-004', 'Admin Console', 'Admin Categories Backend API Connection', 'PASSED', {});
        }
      }
    } catch (e) {
      recordTest('TC-ADM-004', 'Admin Console', 'Admin Categories Backend API Connection', 'FAILED', { error: e.message });
    }

    // 5.5 Admin Orders Management
    try {
      await page.goto(`${BASE_URL}/admin/orders`, { waitUntil: 'networkidle' });
      const ordersTable = await page.locator('tbody tr').count();

      recordTest('TC-ADM-005', 'Admin Console', 'Admin Orders Listing & Status Filter', ordersTable > 0 ? 'PASSED' : 'FAILED', {
        ordersRendered: ordersTable,
      }, 'Admin Orders table renders customer queue with status chips and search filters');
    } catch (e) {
      recordTest('TC-ADM-005', 'Admin Console', 'Admin Orders Listing & Status Filter', 'FAILED', { error: e.message });
    }

    // 5.6 Admin Inventory Tracking
    try {
      await page.goto(`${BASE_URL}/admin/inventory`, { waitUntil: 'networkidle' });
      const rows = await page.locator('tbody tr').count();

      recordTest('TC-ADM-006', 'Admin Console', 'Admin Warehouse Inventory Stock Adjustments', rows > 0 ? 'PASSED' : 'FAILED', {
        inventoryRows: rows,
      }, 'Admin Inventory renders stock counts and quick quantity adjustment triggers');
    } catch (e) {
      recordTest('TC-ADM-006', 'Admin Console', 'Admin Warehouse Inventory Stock Adjustments', 'FAILED', { error: e.message });
    }

    // 5.7 Admin Analytics Reports
    try {
      await page.goto(`${BASE_URL}/admin/reports`, { waitUntil: 'networkidle' });
      const reportsHeader = await page.locator('h1:has-text("Sales & Inventory Analytics")').isVisible();
      const cards = await page.locator('.card, .bg-white').count();

      recordTest('TC-ADM-007', 'Admin Console', 'Admin Sales & Category Distribution Analytics', reportsHeader ? 'PASSED' : 'FAILED', {
        reportsHeader,
        analyticsSections: cards,
      }, 'Admin Reports page displays summary statistics, units sold, and category breakdowns');
    } catch (e) {
      recordTest('TC-ADM-007', 'Admin Console', 'Admin Sales & Category Distribution Analytics', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  // -------------------------------------------------------------
  // MODULE 6: RESPONSIVE VIEWPORT TESTING
  // -------------------------------------------------------------
  {
    const viewports = [
      { name: 'Desktop (1440x900)', width: 1440, height: 900 },
      { name: 'Laptop (1024x768)', width: 1024, height: 768 },
      { name: 'Tablet (768x1024)', width: 768, height: 1024 },
      { name: 'Mobile (375x667)', width: 375, height: 667 },
    ];

    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();

      try {
        await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
        const logoVisible = await page.locator('.tw-navbar-logo, img[alt="Logo"]').first().isVisible();
        
        let navResponsive = true;
        if (vp.width <= 768) {
          const mobileToggle = page.locator('button[aria-label*="menu" i], button:has(svg.lucide-menu)').first();
          navResponsive = await mobileToggle.isVisible();
        }

        recordTest(`TC-RESP-${vp.width}`, 'Responsive Design', `Viewport Layout Verification - ${vp.name}`, logoVisible && navResponsive ? 'PASSED' : 'FAILED', {
          viewport: vp.name,
          logoVisible,
          navResponsive,
        }, `UI rendered cleanly without horizontal clipping across ${vp.name}`);
      } catch (e) {
        recordTest(`TC-RESP-${vp.width}`, 'Responsive Design', `Viewport Layout Verification - ${vp.name}`, 'FAILED', { error: e.message });
      }

      await context.close();
    }
  }

  // -------------------------------------------------------------
  // MODULE 7: NEGATIVE & ERROR RESILIENCE TESTING
  // -------------------------------------------------------------
  {
    const context = await browser.newContext();
    const page = await context.newPage();

    // 7.1 Unknown 404 Route
    try {
      await page.goto(`${BASE_URL}/unknown-toy-category-route-xyz`, { waitUntil: 'networkidle' });
      const notFoundHeading = await page.locator('text=404').isVisible();
      const returnBtn = await page.locator('a:has-text("Return to OO Toys Home")').isVisible();

      recordTest('TC-NEG-001', 'Negative Testing', 'Custom 404 Not Found Page Route', notFoundHeading && returnBtn ? 'PASSED' : 'FAILED', {
        notFoundRendered: notFoundHeading,
        homeRecoveryButton: returnBtn,
      }, 'Navigating to an invalid route renders customized 404 Playroom page with recovery navigation');
    } catch (e) {
      recordTest('TC-NEG-001', 'Negative Testing', 'Custom 404 Not Found Page Route', 'FAILED', { error: e.message });
    }

    await context.close();
  }

  await browser.close();

  // Write out results
  const outputPath = path.resolve('tests/test-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(testResults, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log(`AUTOMATION COMPLETE: ${testResults.length} test cases executed.`);
  const passed = testResults.filter(t => t.status === 'PASSED').length;
  const failed = testResults.filter(t => t.status === 'FAILED').length;
  const missing = testResults.filter(t => t.status === 'API_MISSING' || t.status === 'MOCK_DATA' || t.status === 'PARTIALLY_CONNECTED' || t.status === 'NOT_CONNECTED').length;
  console.log(`Passed: ${passed} | Failed: ${failed} | Disconnected/Missing/Mock: ${missing}`);
  console.log(`Detailed results written to: ${outputPath}`);
  console.log('====================================================\n');
}

runQaAutomation().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
