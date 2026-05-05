# RentKaro Workspace

## Overview

pnpm workspace monorepo using TypeScript. RentKaro is a PG (Paying Guest) accommodation platform connecting tenants with property owners in India.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Routing**: wouter
- **Auth**: Session-based (express-session + bcrypt)
- **State/Data**: TanStack React Query (generated hooks from Orval)

## Artifacts

- **rentkaro** (react-vite, `/`) — Main frontend app
- **api-server** (Express, `/api`) — Backend REST API

## Key Features

- Landing page with hero search, platform stats, featured cities, ML-recommended PGs
- PG search with filters (city, rent range, gender preference, room type, sort)
- Property detail pages with image gallery, amenities, reviews, sentiment analysis scores
- Owner dashboard with stats, recent inquiries, property management
- Tenant booking/inquiry system
- Session-based auth (register/login as tenant or owner)
- Review system with simulated sentiment analysis (DistilBERT-style scores)

## API Routes

- `POST /api/auth/register` — Register tenant or owner
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET /api/auth/me` — Get current user
- `GET /api/properties` — List/search properties (filters: city, minRent, maxRent, genderPreference, availability, sortBy, page, limit)
- `POST /api/properties` — Create property (owner only)
- `GET /api/properties/recommended` — ML-style recommended properties
- `GET /api/properties/cities` — Cities with property counts
- `GET /api/properties/owner/my` — Owner's own properties
- `GET /api/properties/:id` — Property detail with reviews
- `PUT /api/properties/:id` — Update property (owner only)
- `DELETE /api/properties/:id` — Delete property (owner only)
- `GET /api/bookings` — List bookings (role-aware)
- `POST /api/bookings` — Create booking inquiry (tenant only)
- `PUT /api/bookings/:id/status` — Update booking status (owner: approve/reject, tenant: cancel)
- `GET /api/reviews/:propertyId` — Get property reviews
- `POST /api/reviews/:propertyId` — Submit review (tenant only)
- `GET /api/stats/owner` — Owner dashboard stats
- `GET /api/stats/overview` — Platform-wide stats (public)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/rentkaro run dev` — run frontend locally

## Database Schema

- **users** — id, name, email, password_hash, phone, role (tenant|owner), created_at
- **properties** — id, title, description, city, address, rent, deposit, gender_preference, room_type, amenities[], images[], availability, view_count, owner_id, created_at
- **bookings** — id, property_id, tenant_id, message, status (pending|approved|rejected|cancelled), created_at
- **reviews** — id, property_id, tenant_id, rating, comment, sentiment_score, sentiment_label, created_at

## Seeded Test Accounts

All accounts use password: `password123`

- `rahul@example.com` (owner) — has 3 properties
- `priya@example.com` (owner) — has 3 properties
- `arjun@example.com` (tenant)
- `sneha@example.com` (tenant)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
