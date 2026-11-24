# 🧸 OO Toys — Modern Toy E-Commerce Platform (Frontend Phase)

> A vibrant, responsive, modern toy e-commerce frontend built using **React + Vite**, **Bootstrap 5**, and custom CSS design tokens. Engineered with clean separation of concerns and prepared for future **Spring Boot REST API** and **MySQL** integration.

---

## 🌟 Key Highlights & Design Aesthetics

- **Joyful Brand Visual Identity**: Harmonious palette inspired by modern toy stores (Sky Blue `#0284c7`, Joyful Orange `#f97316`, Sunshine Yellow `#fbbf24`, Soft Coral `#ff6b6b`, and Fun Purple `#8b5cf6`).
- **Modern Typography**: Powered by Google Fonts (*Fredoka* for playful headings and *Plus Jakarta Sans* for clean, legible body text).
- **Responsive Across All Devices**: Tested and optimized for Mobile (375px & 430px), Tablet (768px), Laptop (1024px), and Wide Desktop (1440px).
- **Zero Backend Dependency for Demo Phase**: Runs locally out of the box using `LocalStorage` with an initial rich dataset of 25 realistic toys across 8 categories.
- **Spring Boot Ready Architecture**: Features dedicated API clients (`axios`), service abstractions (`productService`, `orderService`, `authService`), and documented REST endpoints for rapid backend wiring.

---

## 🛠️ Technology Stack

| Technology | Purpose |
| :--- | :--- |
| **React 19** | Modern component-based user interface |
| **Vite** | Blazing-fast build tool and dev server |
| **React Router DOM v7** | Client-side routing, nested layouts, and route parameters |
| **Bootstrap 5** | Grid system, form controls, and layout utilities |
| **Custom CSS** | OO Toys design tokens, rounded pills, playful shadows, animations |
| **Lucide React** | Clean, modern vector icons |
| **React Context API** | Global state for Shopping Cart, Wishlist, and Demo Authentication |
| **Axios** | HTTP client configured with base URL and JWT interceptors |
| **Nginx & Docker** | Production deployment container with SPA routing fallback |

---

## 🚀 Quick Start & Local Development

### 1. Prerequisites
- Node.js (v18.0.0 or higher recommended, Node 20/24 supported)
- npm (v9.0.0 or higher)

### 2. Installation
```bash
# Clone or navigate to the project directory
cd /path/to/OO Toys-frontend

# Install dependencies
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at: **`http://localhost:5173`** (or the port shown in your terminal).

### 4. Build for Production
```bash
npm run build
```
The production bundle will be generated in the `dist/` directory.

---

## 🧭 Navigation & Required Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Home Page** | Hero banner, categories, age selector (0–2, 3–5, 6–8, 9+), deals, bestsellers, newsletter |
| `/products` | **Product Catalogue** | Product grid, category filters, age filters, price range, keyword search, sorting |
| `/products/:id` | **Product Details** | Photo gallery thumbnails, specs, demo parent reviews with review submission, related toys |
| `/categories/:categorySlug` | **Category View** | Filtered catalogue with category banner and descriptions |
| `/cart` | **Shopping Cart** | Item quantities, subtotal, promo code (`TOYJOY10`), free shipping progress bar, total |
| `/wishlist` | **Wishlist** | Saved items, 1-click move to cart, persistent LocalStorage |
| `/checkout` | **Checkout** | Customer info, delivery address, Razorpay demo / Cash on Delivery, order summary |
| `/checkout/confirmation/:orderId`| **Confirmation** | Simulated demo order confirmation with tracking number and timeline |
| `/account` | **Customer Profile** | Customer info, editable profile, saved delivery addresses, quick links |
| `/account/orders` | **Order History** | List of demo orders with status tabs and items previews |
| `/account/orders/:id` | **Order Detail** | Milestone stepper (Ordered → Processing → Shipped → Delivered), cancellation request |
| `/login` | **Sign In** | 1-Click demo login buttons (Demo Customer & Demo Admin) and standard form |
| `/register` | **Registration** | Customer sign-up form with instant demo login |
| `/forgot-password` | **Password Reset** | Simulated password recovery flow |
| `/admin` | **Admin Dashboard** | Operations overview: Total products, orders, demo revenue, pending orders, low stock |
| `/admin/products` | **Admin Products** | Product catalog table, search, category filter, edit/delete actions |
| `/admin/products/new` | **Add Product** | Full product creation form with image preview and badge toggles |
| `/admin/products/:id/edit` | **Edit Product** | Update existing product details in demo LocalStorage |
| `/admin/categories` | **Categories Admin** | Category overview and new category creation |
| `/admin/orders` | **Orders Admin** | Live status updater (Ordered → Processing → Shipped → Delivered → Cancelled) |
| `/admin/inventory` | **Inventory Tracking**| Quick stock adjustments (±5 units), low-stock warning thresholds |
| `/admin/reports` | **Reports & Analytics**| Sales analytics, average order value, warehouse category distribution |

---

## 🔑 Demo Authentication & Accounts

Because this is a frontend-only phase, no backend database is required. The app includes safe, simulated authentication using `LocalStorage`.

### 1-Click Quick Login
When clicking on the **Account** dropdown or visiting `/login`, click:
- **Quick Login: Demo Customer** (`priya@example.com` / `Priya Sharma`)
- **Quick Login: Demo Admin** (`admin@OO Toys.com` / `OO Toys Admin`)

*Note: You can also sign in with any mock email and password or register a new customer account.*

---

## 🎁 Active Demo Promo Codes

Test the checkout and coupon functionality in the Cart using these codes:
- `TOYJOY10` — **10% OFF** entire order
- `SUPERKID` — **₹300 OFF** on orders above ₹1,500
- `FIRSTTOY` — **15% OFF** welcome discount

---

## 🔗 Spring Boot REST API Integration Blueprint

All service calls are consolidated inside `src/services/` and use `apiClient.js` with `VITE_API_BASE_URL` (`http://localhost:8080/api`).

When implementing the Spring Boot backend, replace the LocalStorage handlers in each service file with direct `apiClient` HTTP requests:

### 1. Products Controller (`@RestController @RequestMapping("/api/products")`)
- `GET /api/products` — Filter products by `category`, `ageGroup`, `minPrice`, `maxPrice`, `search`, and `sortBy`
- `GET /api/products/{id}` — Fetch single product with reviews and specifications
- `POST /api/admin/products` — Create new toy (Admin protected)
- `PUT /api/admin/products/{id}` — Update toy (Admin protected)
- `DELETE /api/admin/products/{id}` — Delete or deactivate toy (Admin protected)

### 2. Orders Controller (`@RestController @RequestMapping("/api/orders")`)
- `GET /api/orders` — List orders (Admin gets all; customer gets their own)
- `GET /api/orders/{id}` — Retrieve order timeline and items
- `POST /api/orders` — Create customer order and generate order tracking number
- `PATCH /api/admin/orders/{id}/status` — Advance status (`Processing`, `Shipped`, `Delivered`, `Cancelled`)
- `POST /api/orders/{id}/cancel` — Customer cancellation request

### 3. Auth Controller (`@RestController @RequestMapping("/api/auth")`)
- `POST /api/auth/login` — Returns JWT token `{ token, user }`
- `POST /api/auth/register` — Registers customer in MySQL
- `GET /api/auth/me` — Fetches current authenticated user

---

## 🐳 Linux VPS Production Deployment (Docker & Nginx)

This project contains production-ready Docker and Nginx configurations:

### Option A: Deploy via Docker Compose
```bash
# Build and start the container in detached mode
docker compose up -d --build

# Inspect running container
docker compose ps
```
The application will be served on port `80` with Nginx handling SPA routing (`try_files $uri $uri/ /index.html;`) and gzip compression.

### Option B: Deploy directly via Nginx on Ubuntu/Debian VPS
1. Run `npm run build` on the server or in CI/CD.
2. Copy the contents of `dist/` to `/var/www/OO Toys/html`.
3. Copy `nginx.conf` to `/etc/nginx/sites-available/OO Toys` and symlink to `sites-enabled`.
4. Test and reload Nginx:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## 🛡️ Demo Limitations & Security Notice

- **Simulated Payments**: Razorpay and Cash on Delivery options are simulated. No real cards or bank credentials are processed.
- **LocalStorage Storage**: Demo products, cart, wishlist, and orders are stored in the user's browser `LocalStorage`. Clearing browser cache will reset data back to the 25 default sample toys.
- **Resetting Demo Data**: Click **Reset Demo Data** in the Admin sidebar anytime to restore factory dataset.

---

Made with ❤️ for happy kids and playful minds at OO Toys!
# e-combackfrontend
