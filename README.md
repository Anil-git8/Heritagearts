# 🛍️ My Store — Full-Stack Commercial eCommerce Platform

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-008CDD?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2340?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

A modern, high-performance, full-stack commercial eCommerce platform built with Node.js, Express, Supabase, and responsive vanilla web technologies. Features a seamless customer storefront, multi-gateway payments (Stripe & Razorpay), customer order tracking, and a comprehensive admin management dashboard.

---

## ✨ Key Features

### 🛒 Customer Storefront
- **Dynamic Catalog & Search**: Real-time product search, category filtering, price range filters, and sorting.
- **Product Details**: Multi-image galleries, stock availability badges, product variants, customer reviews, and ratings.
- **Interactive Shopping Cart & Wishlist**: Persistent cart and wishlist with live quantity adjustments and price calculations.
- **Multi-Step Checkout**: Address book integration, discount coupon validation, and instant order calculation.
- **Dual Payment Gateways**: Support for **Stripe** (International Cards) and **Razorpay** (UPI, Netbanking, Cards) + Cash on Delivery (COD).
- **Order Tracking & Management**: Live status progression (Pending, Processing, Shipped, Delivered) and downloadable order receipts.
- **Customer Portal**: User profiles, multiple saved addresses, order history, and security settings.

### 📊 Comprehensive Admin Dashboard
- **Analytics & Insights**: Total sales, revenue charts, order counts, and top-selling products.
- **Product Management**: Create, edit, and delete products, manage inventory levels, and upload product images.
- **Category & Brand Management**: Organize the catalog with nested categories and brand associations.
- **Order Processing**: Real-time order fulfillment workflow, status updates, and customer notification triggers.
- **Coupon & Promotion Engine**: Percentage and fixed-amount coupon codes with expiry dates and minimum spend criteria.
- **Customer & Review Moderation**: Manage user accounts and approve/moderate customer product reviews.
- **System Settings**: Store configuration, currency formats, and tax/shipping rules.

### 🛡️ Security & Performance
- **Authentication & Authorization**: Secure JWT-based authentication with bcrypt password hashing and role-based access control (`customer` & `admin`).
- **HTTP Hardening**: Configured with `helmet` for security headers, rate limiting (`express-rate-limit`) against brute-force attacks, and `cors`.
- **Media Uploads**: Secure file upload handling with `multer` and asset storage.
- **Clean Architecture**: Decoupled controllers, middleware, routes, and database models.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | HTML5, CSS3 (Custom Design System & Variables), Vanilla JavaScript (ES6+ Modules) |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase (PostgreSQL) / SQL Schema |
| **Authentication** | JSON Web Tokens (JWT), `bcryptjs` |
| **Payments** | Stripe API, Razorpay SDK |
| **Security & Utilities** | Helmet, CORS, Express-Rate-Limit, Multer, Morgan, UUID |

---

## 📁 Project Structure

```text
my-store/
├── 📁 database/
│   ├── schema.sql              # Database DDL schema & table definitions
│   └── seed.js                 # Sample data seeder script
├── 📁 public/                   # Client-side web application
│   ├── 📁 assets/
│   │   ├── 📁 css/             # Stylesheets (style.css, admin.css, variables.css)
│   │   └── 📁 js/              # Client modules (api.js, state.js, components.js, main.js)
│   ├── index.html              # Homepage
│   ├── shop.html               # Product catalog & filtering
│   ├── product-details.html    # Single product view & reviews
│   ├── cart.html               # Shopping cart
│   ├── checkout.html           # Multi-step checkout & payment
│   ├── orders.html             # Order history
│   ├── order-tracking.html     # Live order tracking
│   ├── wishlist.html           # User wishlist
│   ├── account.html            # Profile & settings
│   ├── admin.html              # Admin dashboard overview
│   ├── admin-products.html     # Admin product catalog management
│   ├── admin-orders.html       # Admin order management
│   ├── admin-analytics.html    # Sales & revenue analytics
│   └── ...                     # Additional storefront & admin pages
├── 📁 server/                   # Express backend
│   ├── 📁 config/              # Supabase & gateway configurations
│   ├── 📁 controllers/         # Business logic for all domain entities
│   ├── 📁 middleware/          # Auth, security, upload, and error handlers
│   ├── 📁 models/              # Database interaction layer
│   ├── 📁 routes/              # Modular Express API routes
│   └── server.js               # Application entrypoint
├── 📁 tests/
│   └── run-tests.js            # Automated backend API tests
├── .env.example                # Template for environment variables
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)
- A [Supabase](https://supabase.com/) project (or local database setup)

### 1. Clone the Repository
```bash
git clone https://github.com/Anil-git8/my-store.git
cd my-store
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy the example environment file and update it with your credentials:
```bash
cp .env.example .env
```

Edit `.env` with your preferred configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
API_BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5000

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Razorpay (India)
RAZORPAY_KEY_ID=rzp_test_placeholder_key_id
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret

# Stripe (Global)
STRIPE_PUBLISHABLE_KEY=pk_test_placeholder_key
STRIPE_SECRET_KEY=sk_test_placeholder_secret
STRIPE_WEBHOOK_SECRET=whsec_placeholder_secret
```

### 4. Database Setup & Seeding
Execute the SQL schema in your Supabase SQL editor using [`database/schema.sql`](database/schema.sql), then populate the initial sample data:
```bash
npm run seed
```

### 5. Start the Server
```bash
# Start in production mode
npm start

# Or start in development mode with live reloading
npm run dev
```

Visit **`http://localhost:5000`** in your browser to view the application.

---

## 🔑 Default Credentials (After Seeding)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@store.com` | `Admin@123` |
| **Customer** | `customer@store.com` | `Customer@123` |

---

## 📡 API Reference Overview

The backend exposes a RESTful API under `/api`:

| Endpoint Group | Route Base | Description |
| :--- | :--- | :--- |
| **Auth** | `/api/auth` | Login, registration, password reset, and user profile |
| **Products** | `/api/products` | Product listings, single item queries, search, and admin CRUD |
| **Categories** | `/api/categories` | Catalog taxonomy and category management |
| **Cart** | `/api/cart` | Cart synchronization and item adjustments |
| **Orders** | `/api/orders` | Order creation, tracking, user order lists, status updates |
| **Checkout** | `/api/checkout` | Order preview, calculation, and coupon validation |
| **Payments** | `/api/payments` | Stripe & Razorpay session creation, verification & webhooks |
| **Wishlist** | `/api/wishlist` | Manage saved customer wishlist items |
| **Reviews** | `/api/reviews` | Post product reviews and fetch ratings |
| **Admin** | `/api/admin` | Dashboard metrics, user accounts, and configuration |
| **Uploads** | `/api/upload` | Product and asset image uploads |

---

## 🧪 Testing

Run the automated test suite to verify endpoints and database connections:
```bash
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
#   H e r i t a g e a r t s  
 