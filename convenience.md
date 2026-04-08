# Project Knowledge Base (Convenience File)
**Project Name:** Resova SaaS (Restaurant POS & E-Commerce System)
**Primary Stack:** MERN (MongoDB, Express, React, Node.js), Vite, Tailwind CSS, Stripe Elements.

## 1. Project Overview
This project is a **Hybrid B2B SaaS + B2C E-Commerce** platform. 
1. **The B2B SaaS (Point of Sale):** Restaurant owners pay a subscription to manage their entire physical restaurant (Menus, Tables, Staff, Orders, Customers CRM, and Analytics).
2. **The B2C E-Commerce (Storefront):** The platform automatically generates a beautiful, SEO-optimized, public storefront for each restaurant originally mapped by ID, but **recently transitioned to strictly Canonical SEO Slugs** (`/store/:slug`). Real customers browse via predictive UI, talk to AI Chatbots, Add to Cart (with Promo math), and check out natively.

## 2. Global Multi-Tenant Architecture & Roles
The platform separates data via `restaurantId`. This ensures Owner A cannot see Owner B's menu or orders.
There is a strict Role-Based Access Control (RBAC) mechanism governed by `auth.middleware.js` across three roles:
*   `system_admin`: The ultimate platform owner. Can view global SaaS statistics (Total Revenue, Total Restaurants) and administer subscriptions. Cannot view individual restaurant orders.
*   `restaurant_owner`: The POS subscriber. Can manage their own specific `restaurantId`'s orders, menu, tables, customer CRM, and upgrade their SaaS tier.
*   `customer`: The end-user who registers on the public e-commerce storefront to place orders and save wishlists.

## 3. Backend Structure (`server/`)
The Express backend follows a highly organized MVC (Model-View-Controller) pattern.
*   **Models (`models/`):** 
    *   `User.model`: Stores all roles. Contains referencing to `restaurantId` (if owner) and a `wishlist` array (if customer).
    *   `Restaurant.model`: Physical parameters, SEO Metadata tags, and auto-generated URL `slug`.
    *   `Order.model`: Tracks `items`, `totalAmount`, `status` (pending, completed), and ties back to both `restaurantId` and `customerId`.
    *   `MenuItem.model`: Belongs to a restaurant. Includes price, category, and robust **E-Commerce fields**: `images` (Array), `brand`, and `stock`.
    *   `Review.model`: Enables mapping customer sentiment strictly to specific `menuItemId` assets.
    *   **Dashboard Specifics:** `Table.model` tracks physical dining geometries. `Staff.model` handles employee roles.
    *   `Subscription.model`: Tracks the B2B SaaS tier (Basic, Standard, Premium).
*   **Controllers & Routes:** Standard CRUD logic guarded by `protect` and `authorize(role)`.

### Special Backend Modules:
*   **`ai.controller.js`:** Instead of costly external LLM APIs, the system utilizes a powerful Rule-Based Regex matching engine. It interprets natural language (e.g. "Where is my order" fetches their live MongoDB order; "Cheap food" searches the DB for items under $10; "Shipping info" returns hardcoded FAQs). It also handles the Product Recommendation Engine.
*   **`payment.controller.js`:** Handles **two isolated Stripe flows**:
    1.  `createPaymentIntent`: Used by the B2C public storefront to fund a food order. **It contains an interceptor math reducer for promo codes** (`SAVE5`, `FIRST10`).
    2.  `createSaaSPaymentIntent`: Used by the B2B POS owners to pay for SaaS Subscription upgrades.
*   **`menu.controller.js` (Resolver Layer):** Exports `resolveStoreSlug`. Because internal dashboards used to link to raw BSON IDs (`/store/[ID]`), this resolver smartly attempts to find a slug match, acting as a fallback organic router.

## 4. Frontend Structure (`client/`)
Built with React + Vite, styled seamlessly with modern glassmorphic Tailwind CSS. The app does not utilize complex state management like Redux; it relies on React Context/Hooks (`useAuth`), `LocalStorage` (for shopping carts unmounted across React Router pages), and direct API service fetches (`services/api.js`).

### Routing & UI Entry Points (`AppRoutes.jsx`):
*   **`/` (Landing Page):** B2B homepage heavily optimized with SaaS copy.
*   **`/dashboard`:** The heart of the POS. Includes `/menu`, `/orders`, `/tables`, `/staff`, and the newly extracted **`/customers` CRM (which bypasses heavy relational models by utilizing MongoDB `.distinct` aggregation against live orders).**
*   **`/store` (System Admin view):** SaaS Overview displaying platform MRR.
*   **`/store/:slug`:** The decoupled, public-facing B2C E-Commerce shopping layout. Contains localized Auth (`/store/:slug/login`) specifically pushing accounts to the `customer` role boundary.
*   **`/store/:slug/item/:productSlug` (PDP):** A completely isolated React view rendering deep details, mock `picsum.photos` carousels, and the mapped Reviews schema. 

### Notable Complex Components & Tricks:
*   **OS Dark Mode Blockers:** Extensive use of `text-gray-900` wrappers natively applied to root dom structures to stop system-level Dark Mode extensions from whiting-out typography globally.
*   **Predictive Local Filtering:** The `<Storefront />` includes an active keystroke Autocomplete dropdown that runs in-memory `useMemo` filter checks against the already mounted `items` array to save on strict backend queries.
*   **`react-helmet-async` / SEO:** Integrated globally. Individual Menu Items natively override `<title>` and `<meta name="description">`.

## 5. Known Tricks & Overrides (For the next Copilot)
*   **Legacy ID Backwards-Compatibility:** All frontend paths mapping `/store/:restaurantId` were refactored to `/store/:slug`. However, inside `Storefront.jsx`, there is a `resolveSlug()` effect bounding. If a raw MongoDB `_id` is passed as a URL chunk, the API maps it to the respective `slug` and physically overwrites the browser history using `navigate(canonicalUrl, { replace: true })`.
*   **Duplicate Key Bug Prevented:** In `auth.controller.js`, when a restaurant is registered, an automated unique `seo.slug` string (Time/Date based) is injected. Do not touch this, or MongoDB throws an `E11000` duplicate key error because the slug is strictly indexed.
*   **Sandbox Environments:** Stripe logic bypasses actual webhooks. Payment Intents are instantly assumed "successful" on the frontend callback, and DB mutations (`/api/subscriptions` upgrade, or `/api/orders` creation) occur via a secondary REST `.put` upon card success. This is intentional for a presentation-safe sandbox.

## 6. Development & Deployment
*   **Seed Data:** Run `npm run seed` in the `server` to wipe the DB and recreate `admin@saas.com` & `demo@restaurant.com` accompanied by full relational schemas and deterministic variables.
*   **Running Locally:** Concurrent servers. Run `npm run dev` separately inside `server/` and `client/`. 
*   **Environment Variables Map:**
    *   Server `.env`: `PORT` (usually 5000), `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `NODE_ENV`.
    *   Client `.env`: `VITE_STRIPE_PUBLISHABLE_KEY`
