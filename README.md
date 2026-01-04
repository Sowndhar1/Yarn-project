# Yarn Business Automation System

An end-to-end sample implementation of the ecommerce add-on described by the user. It exposes a lightweight Express backend plus a React + Vite storefront/admin dashboard so mills can publish yarn availability online and automatically sync orders into the automation system.

## Project structure

```
Consultancy/Project/yarn
├── backend/          # Express API (products + orders)
└── frontend/         # Vite + React client with storefront + admin pages
```

## Backend

1. Install dependencies
   ```bash
   cd backend
   npm install
   ```
2. Start the API server
   ```bash
   npm run dev
   ```
3. Available endpoints (default `http://localhost:4000`)
   - `GET /api/products` – list catalog (filters: `brand`, `count`, `color`, `q`)
   - `GET /api/products/:id` – product detail
   - `GET /api/orders` – list ecommerce orders
   - `POST /api/orders` – create new customer order
   - `GET /api/orders/:id` – order detail
   - `PATCH /api/orders/:id/status` – update status (`pending → delivered` flow)

`src/data/*.js` currently keeps sample catalog + in-memory order storage. Swap with a database later.

## Frontend

1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```
2. Run the dev server (default `http://localhost:5173`)
   ```bash
   npm run dev
   ```
3. Configure API base (optional). Create `frontend/.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:4000/api
   ```

### Auth & Roles

| Role   | Username      | Email                      | Password | Access                                                                 |
| ------ | ------------- | -------------------------- | -------- | ---------------------------------------------------------------------- |
| Admin  | `shivamyarn`  | `admin@yarnbusiness.com`   | `admin123` | Full control: dashboards, stock, purchases, sales, orders, account page |
| Staff  | `staffyarn`   | `staff@yarnbusiness.com`   | `staff123` | Operational modules: dashboard, stock, purchase/sales entry            |

- Login at `/login` with either username or email.
- Tokens are stored in localStorage and auto-hydrated; logout clears local state.
- Change password in `/settings/account` (calls `POST /api/auth/password`).

### Routes

- Public: `/`, `/about`, `/login`
- Protected (admin): `/admin`
- Protected (admin + staff): `/dashboard`, `/stock`, `/purchases/new`, `/sales/new`, `/settings/account`

Tailwind CSS powers the styling; IDEs without Tailwind awareness may warn about `@tailwind`/`@apply` directives.

## Next steps / enhancements

1. Replace in-memory `orders` array with a persistent database.
2. Implement authentication/authorization for the admin panel.
3. Extend product master (images, mill locations, MOQ) and wire it to real ERP data feeds.
4. Add notifications (email/SMS) when order status changes.

This setup provides a working baseline for the requested ecommerce add-on. Run backend + frontend together to demo the full ordering flow.***
