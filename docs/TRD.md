# TripMoja — Technical Requirements Document (TRD)

Version: 1.0
Date: 2026-05-17
Status: Approved for v1 build

---

## 1. Stack Summary

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Framework | Next.js | 15 (App Router) | SSR for trip discovery, Vercel-native deployment, full-stack in one repo |
| Language | TypeScript | 5.x | Type safety across API routes and client components |
| Styling | Tailwind CSS | 4.x | Mobile-first utility classes, no design system overhead |
| Components | shadcn/ui | latest | Accessible primitives on top of Radix UI; no locked-in design decisions |
| Forms | React Hook Form + Zod | latest | Performant form validation; Zod schemas shared between client and API |
| ORM | Prisma | 5.x | Type-safe DB access, migration management, clean schema file |
| Database | PostgreSQL | 16 | Relational model fits the data (users, trips, bookings, reviews all use joins) |
| Database host | Neon | free tier | Serverless Postgres, instant branch-per-PR capability, no server to manage |
| Auth | NextAuth.js (Auth.js) | v5 beta | Email/password in v1; Prisma adapter for session storage |
| Email | Resend | latest | Transactional email; React Email for templates |
| File storage | Vercel Blob | latest | Private bucket for verification docs and user/group photos; CDN included |
| Analytics | Vercel Analytics | built-in | Page view tracking; privacy-friendly; no cookie banner |
| Deployment | Vercel | free tier | Auto-deploys from GitHub main; preview deployments on PRs |

---

## 2. Project Structure

```
tripmoja/
├── app/
│   ├── (public)/              # Logged-out accessible routes
│   │   ├── page.tsx           # / Home and trip search
│   │   ├── trips/
│   │   │   ├── page.tsx       # /trips Search results
│   │   │   └── [id]/page.tsx  # /trips/[id] Trip detail
│   │   └── groups/
│   │       └── join/
│   │           └── [code]/page.tsx  # /groups/join/[code] Invite landing
│   ├── (auth)/                # Auth routes
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify-email/page.tsx
│   ├── (app)/                 # Authenticated routes (session required)
│   │   ├── trips/
│   │   │   └── new/page.tsx   # Create trip
│   │   ├── my-trips/
│   │   │   ├── page.tsx       # Driver: my posted trips
│   │   │   └── [id]/page.tsx  # Driver: trip detail + booking requests
│   │   ├── bookings/
│   │   │   ├── page.tsx       # Passenger: my bookings
│   │   │   └── [id]/page.tsx  # Booking detail with contact reveal
│   │   ├── profile/
│   │   │   ├── [id]/page.tsx  # Any user's public profile
│   │   │   ├── settings/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── groups/
│   │   │   ├── page.tsx       # My groups list
│   │   │   ├── new/page.tsx   # Create group
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Group detail: trip feed + member list
│   │   │       └── invite/page.tsx
│   │   └── admin/
│   │       └── verifications/
│   │           ├── page.tsx   # Pending list
│   │           └── [id]/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── trips/
│   │   │   ├── route.ts           # GET (search), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PATCH, DELETE
│   │   │       └── bookings/route.ts  # POST (request booking)
│   │   ├── bookings/
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PATCH (cancel)
│   │   │       ├── confirm/route.ts
│   │   │       ├── decline/route.ts
│   │   │       └── reviews/route.ts
│   │   ├── groups/
│   │   │   ├── route.ts           # POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PATCH
│   │   │       ├── join/route.ts  # POST (join via invite code)
│   │   │       ├── members/route.ts
│   │   │       └── trips/route.ts
│   │   ├── users/
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── avatar/route.ts
│   │   ├── verifications/
│   │   │   └── route.ts           # POST (submit verification)
│   │   └── admin/
│   │       └── verifications/
│   │           ├── route.ts
│   │           └── [id]/
│   │               ├── route.ts
│   │               └── signed-url/route.ts
│   └── layout.tsx
├── components/
│   ├── trips/
│   ├── bookings/
│   ├── groups/
│   ├── reviews/
│   ├── verification/
│   └── ui/                    # shadcn components
├── lib/
│   ├── auth.ts                # NextAuth config
│   ├── db.ts                  # Prisma client singleton
│   ├── email.ts               # Resend helpers
│   ├── blob.ts                # Vercel Blob helpers (upload, signed URL, delete)
│   ├── validations/           # Zod schemas (shared client + server)
│   └── utils.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── public/
├── .env.example
└── README.md
```

---

## 3. Authentication

**Provider:** NextAuth.js v5 (Auth.js)
**Strategy:** Database sessions (not JWT). Sessions stored in the Session table. Required for server-side session access in Next.js App Router server components.
**Adapter:** @auth/prisma-adapter
**v1 providers:** Credentials (email + password with bcrypt). No OAuth in v1.
**Email verification:** Handled via Resend. On registration, a verification email is sent. The VerificationToken table is used. Unverified users can browse; they cannot post trips or request bookings.
**Admin access:** Determined in the NextAuth session callback. If `session.user.email` is in the `ADMIN_EMAIL` env var (comma-separated), `session.user.isAdmin = true` is injected into the session. No DB column used. Admin status cannot be elevated via DB manipulation.

```typescript
// lib/auth.ts (pattern)
callbacks: {
  session({ session }) {
    const adminEmails = process.env.ADMIN_EMAIL?.split(",").map(e => e.trim()) ?? []
    session.user.isAdmin = adminEmails.includes(session.user.email ?? "")
    return session
  }
}
```

---

## 4. Database

**Provider:** Neon (serverless PostgreSQL)
**Connection:** Neon serverless driver via DATABASE_URL connection string
**ORM:** Prisma 5.x with `prisma generate` for type-safe client
**Migrations:** `prisma migrate dev` (development), `prisma migrate deploy` (CI/CD and production)
**Connection pooling:** Neon's built-in connection pooler. Use the pooler connection string in production (`?pgbouncer=true&connection_limit=1` for serverless functions)

### Key constraints enforced at application level

- `Trip.seatsAvailable >= 0`: enforced in booking confirmation handler before decrement
- `Review.rating` between 1 and 5: enforced by Zod validation on input
- Booking uniqueness per passenger per trip: enforced by API check before insert

---

## 5. File Storage (Vercel Blob)

All file uploads go to a private Vercel Blob bucket. No files are publicly accessible by URL.

### User avatars and group photos

- Uploaded via the profile settings page and group creation form
- Stored with key pattern: `avatars/{userId}/{timestamp}.{ext}` and `groups/{groupId}/{timestamp}.{ext}`
- Served to clients via signed URLs with a long TTL (24 hours) since these are not sensitive
- URL stored in User.avatarUrl and Group.avatarKey

### Verification documents (PII - stricter handling)

- Stored with key pattern: `verifications/{verificationId}/id.{ext}` and `verifications/{verificationId}/license.{ext}`
- Only the Blob key is stored in the DB. The URL is never stored or returned to non-admin clients.
- Admin endpoint `POST /api/admin/verifications/[id]/signed-url` generates a time-limited URL (3600-second TTL)
- Immediately after an APPROVED or REJECTED decision, the API calls `del([idDocKey, licenseKey])` to purge the objects from Blob storage
- The `Verification.docDeletedAt` timestamp is updated to confirm deletion
- After deletion, only `status`, `type`, `vehicleMake`, and `vehicleReg` remain

---

## 6. Email (Resend)

**Templates:** React Email components in `emails/` directory
**From address:** `TripMoja <noreply@tripmoja.vercel.app>` (update when custom domain is set)

### Email events and triggers

| Event | Template | Sender | Recipient |
|-------|----------|--------|-----------|
| Registration | welcome.tsx | system | new user |
| Email verification | verify-email.tsx | system | new user |
| Booking requested | booking-request.tsx | system | driver |
| Booking confirmed | booking-confirmed.tsx | system | passenger |
| Booking declined | booking-declined.tsx | system | passenger |
| Booking cancelled (by passenger) | booking-cancelled-passenger.tsx | system | driver |
| Trip cancelled (by driver) | trip-cancelled.tsx | system | all confirmed passengers |
| Trip reminder | trip-reminder.tsx | system | all confirmed passengers |
| Rating prompt | rating-prompt.tsx | system | both parties (2h after departure) |

**Scheduling:** Rating prompts and trip reminders use a background job. In v1, these can be triggered by a Vercel Cron Job (configured in vercel.json) that runs hourly and queries for trips departing within the window.

---

## 7. API Design Principles

- All API routes are Next.js Route Handlers in `app/api/`
- Authentication checked at the top of every protected route handler using `getServerSession()`
- Request bodies validated with Zod before any DB operation
- Consistent response envelope:
  ```typescript
  { success: true, data: T }           // success
  { success: false, error: string }    // client or server error
  ```
- HTTP status codes used correctly: 200, 201, 400, 401, 403, 404, 409, 500
- No raw SQL. All DB queries via Prisma client.

---

## 8. Security

### Authentication
- Passwords hashed with bcrypt (cost factor 12)
- Sessions expire after 30 days of inactivity
- NEXTAUTH_SECRET must be a random 32-character string

### Verification PII
See Section 5 above. Documents are deleted on decision. Signed URLs expire in 60 minutes. Admin endpoint is protected by `session.user.isAdmin === true` check.

### Input validation
All user inputs validated with Zod at the API boundary. Client-side validation with React Hook Form uses the same Zod schemas (shared via `lib/validations/`).

### File uploads
- Maximum file size: 5MB per document
- Accepted MIME types: image/jpeg, image/png, application/pdf
- Validated server-side before passing to Vercel Blob

### General
- CSRF protection: handled by NextAuth for auth routes; App Router headers handle cross-origin for API routes
- Rate limiting: apply to auth endpoints and verification submissions using a simple in-memory or Upstash Redis counter (v1.1; for v1 rely on Vercel's DDoS protection)
- No secrets in source code. All via environment variables.

---

## 9. Performance

### SSR for trip discovery
The `/trips` search results page and individual trip detail pages (`/trips/[id]`) are server-rendered. Trip data is fetched directly in the Server Component using Prisma. No client-side waterfall on the critical discovery path.

### Caching
- Route-level revalidation: trip listing pages use `revalidate = 60` (1-minute cache)
- After trip creation, posting, or cancellation: `revalidatePath("/trips")`
- User profiles: `revalidate = 3600` (1-hour cache)
- Booking detail and group pages: no caching (dynamic per user)

### Images
- Next.js `<Image>` component with `sizes` prop for responsive loading
- Avatars and group photos served from Vercel Blob CDN via signed URLs

---

## 10. Analytics

**Provider:** Vercel Analytics
**Setup:** `@vercel/analytics` package, `<Analytics />` component in root layout
**What is tracked:** Page views and unique visitors per route
**What is NOT tracked:** User IDs, sessions, events, or any personally identifiable data
**No cookie banner required:** Vercel Analytics is privacy-friendly by default

---

## 11. Deployment

**Platform:** Vercel (free tier)
**Repository:** github.com/isaachunja/tripmoja (public)
**Branch strategy:**
- `main` -> production (tripmoja.vercel.app)
- Feature branches -> preview deployments (auto-generated URLs)

**Environment variables:** Set in Vercel dashboard for production. `.env.local` for local development. `.env.example` in repo (no values, only keys).

**Database migrations in CI:**
- Add a build command that runs `prisma migrate deploy` before `next build`
- Neon connection: use the pooler endpoint with `?pgbouncer=true` in production

---

## 12. Environment Variables

```bash
# Database
DATABASE_URL=                  # Neon connection string (pooler for production)

# NextAuth
NEXTAUTH_SECRET=               # Random 32-char string (openssl rand -base64 32)
NEXTAUTH_URL=                  # https://tripmoja.vercel.app or http://localhost:3000

# Email
RESEND_API_KEY=                # From resend.com dashboard

# File storage
BLOB_READ_WRITE_TOKEN=         # From Vercel dashboard > Storage > Blob

# Admin
ADMIN_EMAIL=                   # Comma-separated admin emails e.g. "a@b.com,c@d.com"
```

---

## 13. Third-Party Services Summary

| Service | Purpose | Cost | Account required |
|---------|---------|------|-----------------|
| Neon | PostgreSQL database | Free tier (0.5GB) | neon.tech |
| Vercel | Hosting + Blob + Analytics | Free tier | vercel.com |
| Resend | Transactional email | Free tier (3,000/month) | resend.com |
| GitHub | Source control + CI | Free (public repo) | github.com |

Total monthly cost at v1 scale: $0

---

## 14. Key Technical Decisions

### Decision: Monorepo, not separate API + SPA
Solo build, open source. One repo is simpler to contribute to and deploy. Next.js API routes are sufficient for v1 scale (hundreds of users on one corridor).

### Decision: Database sessions, not JWT
App Router server components need to verify session server-side without a round-trip. Database sessions via NextAuth Prisma adapter make this clean.

### Decision: Vercel Blob over Cloudinary
No extra account. Built into the Vercel project. The private bucket capability is essential for the verification PII model. Cloudinary's image transformations are not needed in v1.

### Decision: Resend over SMTP or SendGrid
Simple API, React Email templates, generous free tier, excellent deliverability. No legacy SMTP configuration.

### Decision: No real-time infrastructure in v1
Trips are scheduled, not on-demand. Polling or email/SMS is sufficient. WebSocket infrastructure (Pusher, Ably) adds cost and complexity that is not justified at v1 scale.

### Decision: Soft deletes everywhere
TripMoja is a trust platform. Audit trail matters. All User, Trip, and Booking records use `deletedAt` or `cancelledAt` timestamps. Nothing is hard-deleted from the DB.
