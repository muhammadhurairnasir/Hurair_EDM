# Project Knowledge Base (Convenience File)
**Project Name:** Resova SaaS (Restaurant POS & E-Commerce System)
**Primary Stack:** MERN (MongoDB, Express, React, Node.js), Vite, Tailwind CSS, Stripe Elements.

## 1. Project Overview
This project is a **Hybrid B2B SaaS + B2C E-Commerce** platform. 
1. **The B2B SaaS (Point of Sale):** Restaurant owners pay a subscription to manage their entire physical restaurant (Menus, Tables, Staff, Orders, and Analytics).
2. **The B2C E-Commerce (Storefront):** The platform automatically generates a beautiful, SEO-optimized, public storefront for each restaurant (`/store/:restaurantId`) where real customers can browse menus, talk to an AI Chatbot, Add to Cart, and fully Checkout.

## 2. Global Multi-Tenant Architecture & Roles
The platform separates data via `restaurantId`. This ensures Owner A cannot see Owner B's menu or orders.
There is a strict Role-Based Access Control (RBAC) mechanism governed by `auth.middleware.js` across three roles:
*   `system_admin`: The ultimate platform owner. Can view global SaaS statistics (Total Revenue, Total Restaurants) and administer subscriptions. Cannot view individual restaurant orders.
*   `restaurant_owner`: The POS subscriber. Can manage their own specific `restaurantId`'s orders, menu, tables, and upgrade their SaaS tier.
*   `customer`: The end-user who registers on the public e-commerce storefront to place orders and save wishlists.

## 3. Backend Structure (`server/`)
The Express backend follows a highly organized MVC (Model-View-Controller) pattern.
*   **Models (`models/`):** 
    *   `User.model`: Stores all roles. Contains referencing to `restaurantId` (if owner) and a `wishlist` array (if customer).
    *   `Restaurant.model`: Physical parameters, SEO Metadata tags, and auto-generated URL `slug`.
    *   `Order.model`: Tracks `items`, `totalAmount`, `status` (pending, completed), and ties back to both `restaurantId` and `customerId`.
    *   `MenuItem.model`: Belongs to a restaurant. Includes price, category, photo url.
    *   **Dashboard Specifics:** `Table.model` tracks physical dining geometries and statuses. `Staff.model` handles employee POS Pin access and roles (Waiter/Cashier).
    *   `Subscription.model`: Tracks the B2B SaaS tier (Basic, Standard, Premium) for a specific restaurant.
*   **Controllers & Routes:** Standard CRUD logic. Deeply protects endpoints via `protect` and `authorize(role)` middlewares.

### Special Backend Modules:
*   **`ai.controller.js`:** Instead of costly external LLM APIs, the system utilizes a powerful Rule-Based Regex matching engine. It interprets natural language (e.g. "Where is my order" fetches their live MongoDB order; "Cheap food" searches the DB for items under $10; "Shipping info" returns hardcoded FAQs). It also handles the Product Recommendation Engine.
*   **`payment.controller.js`:** Handles **two isolated Stripe flows**:
    1.  `createPaymentIntent`: Used by the B2C public storefront to fund a food order.
    2.  `createSaaSPaymentIntent`: Used by the B2B POS owners to pay for SaaS Subscription upgrades ($79 Standard, $149 Premium).

## 4. Frontend Structure (`client/`)
Built with React + Vite, styled seamlessly with modern glassmorphic Tailwind CSS. The app does not utilize complex state management like Redux; it relies on React Context/Hooks (`useAuth`) and direct API service fetches (`services/api.js`).

### Routing & UI Entry Points (`AppRoutes.jsx`):
*   **`/` (Landing Page):** B2B homepage heavily optimized with SaaS copy. Pricing buttons seamlessly hand off `?tier=` tracking directly through registration into the Stripe Subscription upgrade funnel.
*   **`/dashboard`:** The heart of the POS. Includes `/menu`, `/orders`, `/tables`, and `/staff`.
*   **`/store` (System Admin view):** Rebranded as the **SaaS Overview**. Pulls live MongoDB metrics (MRR, Total Users) detailing the success of the platform.
*   **`/subscriptions`:** The billing portal where a `restaurant_owner` mounts the B2B Stripe Elements card to pay for their SaaS unlock.
*   **`/settings`:** Fully functioning dual REST form hitting `/api/settings` to mutate both the `User` document and physical `Restaurant` document globally.
*   **`/store/:restaurantId`:** The decoupled, public-facing B2C E-Commerce shopping layout. Contains localized Auth (`/login`) specifically pushing accounts to the `customer` role boundary.

### Notable Complex Components & Tools:
*   **`react-helmet-async` / SEO:** Integrated globally. Individual Menu Items natively override `<title>` and `<meta name="description">` creating organic long-tail search dominance for the storefront.
*   **`Chatbot.jsx`:** A floating storefront widget acting as the primary conversational interface. It holds local chat history and communicates constantly with `ai.controller.js`.
*   **`StripeCheckoutForm.jsx`:** Safely handles the secure iframe injection of Stripe's `CardElement`. The component is highly modular and is actually utilized twice perfectly: once on the storefront for food, and once natively inside `/subscriptions` for B2B upgrades.

## 5. Known Tricks & Overrides (For the next Copilot)
*   **Duplicate Key Bug Prevented:** In `auth.controller.js`, when a restaurant is registered, an automated unique `seo.slug` string (Time/Date based) is injected. Do not touch this, or MongoDB throws an `E11000` duplicate key error because the slug is strictly indexed.
*   **Sandbox Environments:** Stripe logic completely bypasses actual webhooks. Payment Intents are instantly assumed "successful" on the frontend callback, and DB mutations (`/api/subscriptions` upgrade, or `/api/orders` creation) occur via a secondary REST `.put` upon card success. This is intentional for a presentation-safe sandbox.

## 6. Development & Deployment
*   **Seed Data:** Run `npm run seed` in the `server` to wipe the DB and recreate `admin@saas.com` & `demo@restaurant.com`.
*   **Running Locally:** Concurrent servers. Run `npm run dev` separately inside `server/` and `client/`. 
*   **Environment Variables Map:**
    *   Server `.env`: `PORT` (usually 5000), `MONGO_URI`, `JWT_SECRET`, `STRIPE_SECRET_KEY`, `NODE_ENV`.
    *   Client `.env`: `VITE_STRIPE_PUBLISHABLE_KEY` (must match the Server's equivalent key architecture).
