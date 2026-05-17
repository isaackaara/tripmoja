# TripMoja — Architecture Decisions

## Stack

### Frontend
- **Next.js 15** (App Router, TypeScript) - SSR for SEO, fast page loads on mobile, Vercel deployment
- **Tailwind CSS** - mobile-first utility styling, no design system overhead
- **shadcn/ui** - accessible component primitives (Dialog, Select, Card, Badge, etc.)
- **React Hook Form + Zod** - form validation, especially trip creation and booking flows

### Backend
- **Next.js API routes** - same repo, no separate service to deploy
- **Prisma ORM** - type-safe DB access, migration management, clean schema file
- **PostgreSQL** - relational model is the right fit (users, trips, bookings, reviews all have complex joins)

### Auth
- **NextAuth.js v5** (Auth.js) - email/password in v1; Google OAuth planned for v1.1
- Sessions stored in database (not JWT) - required for server-side session checks in App Router

### Notifications
- **Resend** - transactional email (booking requests, acceptances, reminders, rating prompts)
- **Africa's Talking** - SMS (v1.1 only; critical for Kenyan users who may not check email)

### Deployment
- **Vercel** - free tier, auto-deploys from GitHub main
- **Neon** - managed Postgres (chosen over Supabase for simplicity)
- **Production URL:** https://tripmoja.vercel.app
- **GitHub:** https://github.com/isaackaara/tripmoja (public, MIT)

### Vercel + Prisma gotcha
Vercel caches `node_modules` between builds. Prisma Client is generated into `node_modules/@prisma/client` and is NOT regenerated automatically on Vercel unless you explicitly run `prisma generate` in the build step.

Fix: set `"build": "prisma generate && next build"` in `package.json`. Without this, the build succeeds locally but fails on Vercel with `PrismaClientInitializationError`.

### Open Source Infrastructure
- Public GitHub repo (isaackaara/tripmoja)
- MIT License
- Internal ops files (.claude/, session-log.md, COMPLETIONS.md, INBOX.md, meeting-prep/, CLAUDE.md) are gitignored - keep the public repo clean
- `.env.example` kept in sync
- No secrets committed, ever

---

## Key Architectural Decisions

### Decision 1: Monorepo (Next.js full-stack) not separate API + SPA
**Why:** Solo build, open source. One repo is simpler to run, contribute to, and deploy. Next.js API routes handle all backend needs for v1 scale (hundreds of users on a single corridor).

### Decision 2: No real-time features in v1
**Why:** Real-time requires WebSockets or SSE infrastructure (Pusher, Ably, etc.) which adds complexity and cost. Trips are scheduled, not on-demand. Polling or email/SMS is sufficient for v1.

### Decision 3: No in-app payments in v1
**Why:** Payments add regulatory, customer service, and dispute risk. This is the exact reason the original Trip Moja was unsustainable. Off-platform payment (WhatsApp M-Pesa) is the user behavior anyway. The platform's job in v1 is trust and coordination, not money movement.

### Decision 4: Server-side rendering for trip listings
**Why:** Trip search must be fast on mobile. SSR avoids client-side waterfall. Trip listing pages are the most critical UX surface.

### Decision 5: Soft-delete for trips and bookings
**Why:** Auditability matters in a trust platform. Never hard-delete. Use `cancelledAt` timestamps instead.

### Decision 6: Bilateral review system
**Why:** Both driver and passenger rate each other. This is BlaBlaCar's core trust mechanism. Ratings are only revealed after both parties submit (prevents anchoring bias).

---

## Folder Structure (planned)

```
tripmoja/
├── app/                    # Next.js App Router
│   ├── (auth)/             # login, register, verify-email
│   ├── (dashboard)/        # logged-in shell
│   │   ├── trips/          # browse + create trips
│   │   ├── bookings/       # my bookings (passenger view)
│   │   ├── my-trips/       # my listed trips (driver view)
│   │   └── profile/        # user profile + ratings
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth handlers
│   │   ├── trips/          # CRUD
│   │   ├── bookings/       # request, accept, decline
│   │   └── reviews/        # submit, retrieve
│   └── layout.tsx
├── components/
│   ├── trips/              # TripCard, TripSearch, TripForm
│   ├── bookings/           # BookingRequest, BookingStatus
│   ├── reviews/            # StarRating, ReviewForm
│   └── ui/                 # shadcn components
├── lib/
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client singleton
│   ├── email.ts            # Resend helpers
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   └── ...
├── .env.example
├── README.md
└── package.json
```
