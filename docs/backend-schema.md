# TripMoja — Backend Schema

Complete Prisma schema and design notes. This is the authoritative data model for v1.

---

## Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────────
// NEXTAUTH V5 ADAPTER TABLES
// Required by @auth/prisma-adapter. Do not rename.
// ─────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─────────────────────────────────────────────
// CORE MODELS
// ─────────────────────────────────────────────

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  password      String?   // nullable to allow future OAuth without migration
  phone         String?
  bio           String?
  avatarUrl     String?
  rating        Float?    // stored average; recalculated on every new revealed Review
  tripCount     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? // soft delete only; never hard-delete users

  accounts         Account[]
  sessions         Session[]
  tripsAsDriver    Trip[]
  bookings         Booking[]
  reviewsGiven     Review[]          @relation("reviewer")
  reviewsReceived  Review[]          @relation("reviewee")
  verification     Verification?
  groupMemberships GroupMembership[]
  ownedGroups      Group[]
}

// ─────────────────────────────────────────────

model Route {
  id          String @id @default(cuid())
  origin      String
  destination String
  distanceKm  Int?
  durationMin Int?   // estimated travel time in minutes

  trips Trip[]

  @@unique([origin, destination])
}

// Seed data (prisma/seed.ts):
//   { origin: "Nanyuki", destination: "Nairobi" }
//   { origin: "Nairobi",  destination: "Nanyuki"  }

// ─────────────────────────────────────────────

model Trip {
  id             String     @id @default(cuid())
  driverId       String
  routeId        String
  departureAt    DateTime
  origin         String     // specific pickup point e.g. "Nanyuki Total", "Nairobi CBD"
  destination    String     // specific dropoff point
  seatsTotal     Int
  seatsAvailable Int        // decremented on CONFIRMED booking; never below 0
  pricePerSeat   Int        // KES; stored as integer (no decimals)
  tripType       TripType
  notes          String?
  isPublic       Boolean    @default(true)  // visible in public marketplace
  status         TripStatus @default(OPEN)
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  cancelledAt    DateTime?  // soft cancel

  driver   User      @relation(fields: [driverId], references: [id])
  route    Route     @relation(fields: [routeId], references: [id])
  bookings Booking[]
  groups   TripGroup[] // zero or more groups this trip is also shared to
}

enum TripType {
  SELF_DRIVE    // driver owns and drives the car
  HIRED_DRIVER  // owner hired someone to drive their car
  TAXI_RENTAL   // rented vehicle with driver; more commercial
}

enum TripStatus {
  OPEN      // accepting bookings
  FULL      // seatsAvailable == 0
  COMPLETED // trip has departed and completed
  CANCELLED // driver or admin cancelled
}

// ─────────────────────────────────────────────

model Booking {
  id          String        @id @default(cuid())
  tripId      String
  passengerId String
  seatsBooked Int           @default(1)
  status      BookingStatus @default(PENDING)
  message     String?       // optional note from passenger to driver
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  cancelledAt DateTime?

  trip      Trip     @relation(fields: [tripId], references: [id])
  passenger User     @relation(fields: [passengerId], references: [id])
  reviews   Review[]
}

enum BookingStatus {
  PENDING    // passenger requested; awaiting driver decision
  CONFIRMED  // driver accepted; seats decremented
  DECLINED   // driver declined
  COMPLETED  // trip completed; rating window opens
  CANCELLED  // either party cancelled after confirmation; seats restored
}

// ─────────────────────────────────────────────

model Review {
  id         String   @id @default(cuid())
  bookingId  String
  reviewerId String   // the person writing the review
  revieweeId String   // the person being reviewed
  rating     Int      // 1 to 5 inclusive
  comment    String?
  revealed   Boolean  @default(false) // true when both parties have submitted, or after 48h
  createdAt  DateTime @default(now())

  booking  Booking @relation(fields: [bookingId], references: [id])
  reviewer User    @relation("reviewer", fields: [reviewerId], references: [id])
  reviewee User    @relation("reviewee", fields: [revieweeId], references: [id])

  @@unique([bookingId, reviewerId]) // one review per person per booking
}

// Review reveal logic (implemented in API, not DB):
//   Reveal when: both parties have submitted their review for the same booking
//   OR: 48 hours have passed since booking COMPLETED and at least one review exists
//   On reveal: recalculate User.rating for the reviewee

// ─────────────────────────────────────────────

model Verification {
  id           String             @id @default(cuid())
  userId       String             @unique
  type         VerificationType
  idDocKey     String?            // Vercel Blob object key (NOT the public URL)
  licenseKey   String?            // driver only; same pattern
  vehicleMake  String?            // driver only
  vehicleReg   String?            // driver only; e.g. "KDD 123A"
  status       VerificationStatus @default(PENDING)
  reviewedAt   DateTime?
  reviewNotes  String?            // admin notes; not shown to user
  docDeletedAt DateTime?          // timestamp when Blob objects were purged after decision
  createdAt    DateTime           @default(now())
  updatedAt    DateTime           @updatedAt

  user User @relation(fields: [userId], references: [id])
}

enum VerificationType {
  IDENTITY // passenger: ID document only
  DRIVER   // driver: ID + driving license + vehicle details
}

enum VerificationStatus {
  PENDING  // submitted; awaiting admin review
  APPROVED // badge granted; docs purged
  REJECTED // docs purged; user can resubmit
}

// PII handling:
//   - Blob keys stored in DB; raw URLs never exposed to non-admin
//   - Admin generates signed URL via POST /api/admin/verifications/[id]/signed-url
//   - Signed URL TTL: 3600 seconds (60 minutes)
//   - After approve or reject: Blob objects deleted; docDeletedAt stamped
//   - Only the VerificationStatus and badge type persist long-term

// ─────────────────────────────────────────────

model Group {
  id          String     @id @default(cuid())
  name        String
  description String?
  avatarKey   String?    // Vercel Blob key for group photo
  inviteCode  String     @unique @default(cuid()) // used in /groups/join/[code]
  accessType  AccessType @default(INVITE_ONLY)
  createdById String
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  createdBy   User              @relation(fields: [createdById], references: [id])
  memberships GroupMembership[]
  trips       TripGroup[]
}

enum AccessType {
  INVITE_ONLY      // only reachable via invite link; anyone with link auto-joins (no approval)
  REQUEST_TO_JOIN  // reachable via link; must be approved by admin before becoming ACTIVE
}

// ─────────────────────────────────────────────

model GroupMembership {
  id        String           @id @default(cuid())
  groupId   String
  userId    String
  role      MemberRole       @default(MEMBER)
  status    MembershipStatus @default(ACTIVE)
  joinedAt  DateTime?        // null if still PENDING
  createdAt DateTime         @default(now())

  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user  User  @relation(fields: [userId], references: [id])

  @@unique([groupId, userId])
}

enum MemberRole {
  ADMIN  // can manage members, approve requests, edit group settings
  MEMBER // can view and post trips within the group
}

enum MembershipStatus {
  ACTIVE  // full member
  PENDING // submitted request; awaiting admin approval (REQUEST_TO_JOIN groups only)
}

// ─────────────────────────────────────────────

model TripGroup {
  tripId  String
  groupId String

  trip  Trip  @relation(fields: [tripId], references: [id], onDelete: Cascade)
  group Group @relation(fields: [groupId], references: [id], onDelete: Cascade)

  @@id([tripId, groupId])
}

// A trip with isPublic=true and entries in TripGroup is visible in both
// the public marketplace AND those groups simultaneously.
// A trip with isPublic=false and entries in TripGroup is group-only.
// A trip with isPublic=true and no TripGroup entries is public-only.
```

---

## Design Notes

### Why isPublic is a boolean, not derived from TripGroup

A trip can be visible to: public only, one or more groups only, or both at once (like posting to multiple subreddits). Storing `isPublic` as a boolean is explicit and queryable without a join. The absence of TripGroup entries alone cannot mean "public" because that would make it impossible to post to groups-only without also hiding from public.

### Seats consistency

`seatsAvailable` is the source of truth and is modified transactionally:
- CONFIRMED booking: `seatsAvailable -= seatsBooked`
- CANCELLED confirmed booking: `seatsAvailable += seatsBooked`
- When `seatsAvailable == 0`: trip status moves to FULL
- Enforce with application-level checks. Add a DB check constraint after confirming Neon supports it: `CONSTRAINT seats_non_negative CHECK (seats_available >= 0)`

### Rating computation

`User.rating` is a denormalized average stored on the User row for query performance (trip listing pages need it without a join). Recalculate with:
```
UPDATE User SET rating = (
  SELECT AVG(rating) FROM Review WHERE revieweeId = userId AND revealed = true
) WHERE id = userId
```
Run this after any Review is revealed.

### Verification doc lifecycle

1. User uploads doc -> stored in Vercel Blob private bucket -> only key stored in DB
2. Admin requests signed URL via POST /api/admin/verifications/[id]/signed-url (60-min TTL)
3. Admin views, approves or rejects
4. API deletes Blob objects immediately after decision
5. `docDeletedAt` is stamped. Only `status`, `type`, and `vehicleMake/vehicleReg` (driver) persist.

### Admin identification

Admin access is determined at the session level, not in the DB schema. The NextAuth session callback checks if `session.user.email` is in the `ADMIN_EMAIL` environment variable (comma-separated list). No `isAdmin` column in the User table - avoids privilege escalation via DB manipulation.

### Group invite codes

`Group.inviteCode` uses `@default(cuid())` which generates a unique random string at creation. The invite URL is `/groups/join/[inviteCode]`. Regenerating the invite code (to invalidate old links) is possible by updating this field.

---

## Seed Data (prisma/seed.ts)

```typescript
// Seed the two canonical routes
await prisma.route.createMany({
  data: [
    { origin: "Nanyuki", destination: "Nairobi", distanceKm: 200, durationMin: 180 },
    { origin: "Nairobi", destination: "Nanyuki", distanceKm: 200, durationMin: 180 },
  ],
  skipDuplicates: true,
})
```

No other seed data. Users, trips, groups, and bookings are created through the application.

---

## Environment Variables Required

```
DATABASE_URL=           # Neon PostgreSQL connection string
NEXTAUTH_SECRET=        # random 32-char string
NEXTAUTH_URL=           # https://tripmoja.vercel.app (or http://localhost:3000)
RESEND_API_KEY=         # for booking notification emails
BLOB_READ_WRITE_TOKEN=  # Vercel Blob (private bucket)
ADMIN_EMAIL=            # comma-separated admin emails e.g. "a@b.com,c@d.com"
```
