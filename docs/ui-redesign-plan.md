# TripMoja UI/UX Redesign Plan

50 recommendations, 8 phases. Ordered by: low risk first, dependencies respected,
highest visual impact per session. Each phase is a self-contained deliverable.

---

## Phase 1: Design System Cleanup
**Covers:** #3, #7, #8, #13, #14, #48, #49, #50
**Sessions:** 1
**Risk:** Low - style and token changes only, no logic touched

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 7 | Monochrome base: near-white bg, near-black text, orange CTA only, blue as links | `globals.css`, `tailwind.config.ts` |
| 13 | Price: larger font size and heavier weight in TripCard | `components/brand/trip-card.tsx` |
| 14 | Seat scarcity color: neutral / orange / red thresholds | `components/brand/trip-card.tsx` |
| 3 | Strip TripCard to 4 elements: time, seats, price, driver name + rating | `components/brand/trip-card.tsx` |
| 8 | Replace pill row with a single status line: "Saloon - 3 seats left - 7:00 AM" | `components/brand/trip-card.tsx` |
| 48 | Mark optional fields "(optional)" - remove asterisk pattern | `app/(auth)/register/page.tsx`, `app/trips/new/page.tsx` |
| 49 | Dark mode: add `[data-theme=dark]` token overrides in globals.css | `globals.css` |
| 50 | Landing headline becomes a question: "Need a seat to Nairobi today?" | `app/page.tsx` |

**Milestone:** Visual diff is immediately obvious. TripCard is leaner. Landing feels direct.

---

## Phase 2: Navigation Restructure
**Covers:** #1, #2, #11, #12, #19, #20, #30, #38
**Sessions:** 1
**Risk:** Medium - BottomNav changes affect every page

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 2 | Collapse to 3 tabs: Feed, Post, Me. Remove Groups tab and raised FAB | `components/brand/bottom-nav.tsx` |
| 1 | Feed defaults to today's trips on the primary corridor. Route swap button | `app/trips/page.tsx` |
| 11 | Date navigation: horizontal scroll strip (Yesterday/Today/Tomorrow/dates) | new `components/ui/date-strip.tsx`, `app/trips/page.tsx` |
| 12 | Hide filter chips behind a single "Filter" icon button | `app/trips/page.tsx` |
| 19 | Sort feed by departure time ascending by default | `app/trips/page.tsx`, `lib/mock-data.ts` |
| 20 | Remove onboarding slides. Land directly on feed | `app/page.tsx` (simplify hero, direct CTA to /trips) |
| 30 | Bottom sheet dismiss on Android back (popstate handler) | new `components/ui/bottom-sheet.tsx` |
| 38 | Tab state persistence: store last route+date in sessionStorage | `app/trips/page.tsx` |

**Milestone:** App opens to a usable feed in one tap. Nav is clean. Date selection is instant.

---

## Phase 3: Feed and Card Interactions
**Covers:** #4, #9, #22, #25, #29, #37, #46, #47
**Sessions:** 2
**Risk:** Medium - introduces bottom sheet pattern across the app

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 4 | Trip detail as bottom sheet instead of separate page | new `components/ui/bottom-sheet.tsx`, `app/trips/page.tsx` - keep `/trips/[id]` for deep links |
| 9 | Sticky compact search bar (From/To) pinned above feed, expands on tap | new `components/ui/search-bar.tsx`, `app/trips/page.tsx` |
| 22 | Pickup/dropoff shown as neighborhood label, not full address | `lib/utils.ts` (add `formatNeighborhood()`), `components/brand/trip-card.tsx` |
| 25 | Skeleton card loading states while feed fetches | new `components/ui/skeleton.tsx`, `app/trips/page.tsx` |
| 29 | "Filling fast" text label when 1-2 seats remain (alongside color signal) | `components/brand/trip-card.tsx` |
| 37 | When a trip is full: render "Similar trips" inline below the card | `app/trips/page.tsx` |
| 46 | Progressive avatar loading: color placeholder first, image when loaded | `components/brand/avatar.tsx` |
| 47 | "Same route, different day" suggestion under a full trip | `app/trips/page.tsx` |

**Milestone:** Feed feels fast. No full-page navigation for trip inspection. Scarcity is visible.

---

## Phase 4: Forms and Registration
**Covers:** #5, #16, #28, #32, #35, #39, #40
**Sessions:** 1
**Risk:** Low-medium - auth form changes, no schema changes

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 16 | Registration: phone + name + password only. Email optional, shown collapsed | `app/(auth)/register/page.tsx` |
| 28 | Remove profile photo upload requirement. Initial avatar is default | `app/(auth)/register/page.tsx`, `components/brand/avatar.tsx` |
| 40 | No password-confirm field. Replace with show/hide toggle | `app/(auth)/register/page.tsx`, `app/(auth)/login/page.tsx` |
| 5 | Create Trip becomes one-question-at-a-time: single field per screen, progress indicator | `app/trips/new/page.tsx` (multi-step rewrite) |
| 35 | "Add notes" collapsed behind a text link on Create Trip | `app/trips/new/page.tsx` |
| 39 | Inline validation: validate as user types, not on submit | `app/(auth)/register/page.tsx`, `app/trips/new/page.tsx` |
| 32 | Contextual input types: inputMode="numeric" for price/phone, autocapitalize for name | all form pages |

**Milestone:** Registration takes under 30 seconds. Trip posting takes under 60 seconds.

---

## Phase 5: Booking Flow
**Covers:** #10, #15, #21, #23, #24, #26, #31, #43, #44
**Sessions:** 2
**Risk:** High - core booking flow, requires server actions and DB

**Prerequisite:** Neon DB wired, Prisma migrate run, auth server actions working.

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 21 | Driver average response time shown on trip card and bottom sheet | `lib/utils.ts`, `components/brand/trip-card.tsx`, server action |
| 23 | Driver phone number hidden until booking accepted | `app/api/bookings/[id]/route.ts`, trip bottom sheet |
| 15 | Swipe right on trip card to request a seat (touch gesture) | `components/brand/trip-card.tsx` (touch handlers) |
| 10 | Post-request confirmation in WhatsApp-style language | `components/ui/booking-confirmation.tsx` |
| 26 | Accepted booking generates a plain-text shareable summary | `app/bookings/[id]/page.tsx` |
| 24 | "Travel again" shortcut for drivers the user has booked before | `app/trips/page.tsx`, server action (booking history query) |
| 43 | Passenger cancel within 30 min: one tap, no reason. After 30 min: short reason | `app/bookings/[id]/page.tsx`, server action |
| 44 | Persistent "pending request" banner on feed when booking is unconfirmed | `app/trips/page.tsx`, layout component |
| 31 | Error messages rewritten to plain English with a cause and an action | all server actions, `lib/errors.ts` (new) |

**Milestone:** Full booking loop works end-to-end. Passenger can request, driver can accept, both get confirmation.

---

## Phase 6: Driver Tools
**Covers:** #6, #27, #34, #42
**Sessions:** 1
**Risk:** Medium - new driver-facing UI, one new server action

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 6 | Verification badge: large pill at top of driver bottom sheet, before name | `components/ui/driver-sheet.tsx` |
| 27 | Trip count added to driver profile: "47 trips completed" | `components/ui/driver-sheet.tsx`, server query |
| 34 | "I'm on my way" button on driver's active trip view - triggers SMS to passengers | `app/trips/[id]/manage/page.tsx` (new), server action, Resend/Africa's Talking |
| 42 | "Pause bookings" toggle on driver's trip without deleting the listing | `app/trips/[id]/manage/page.tsx`, server action (`isAcceptingRequests` field on Trip) |

**Note:** #42 requires a schema change - add `isAcceptingRequests Boolean @default(true)` to Trip model.

**Milestone:** Drivers have a management surface. Passengers see live driver status.

---

## Phase 7: Trust and Ratings
**Covers:** #17, #33, #36
**Sessions:** 1
**Risk:** Medium - SMS integration, rating logic

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 36 | Mutual blind ratings: both sides rate before either sees the other's score | `app/bookings/[id]/rate/page.tsx`, server action (hold ratings until both submitted) |
| 33 | Estimated arrival time shown on trip card and detail sheet | `lib/utils.ts` (add `estimateArrival(route, departureTime)`), trip card |
| 17 | Post-trip SMS rating link via Africa's Talking: short URL, no login required, 1-5 stars | `app/rate/[token]/page.tsx` (new, public route), server action, Africa's Talking SDK |

**Note:** #17 requires a `RatingToken` model in schema (token, bookingId, expiresAt, used).

**Milestone:** Ratings are collected passively. Arrival times set correct expectations.

---

## Phase 8: Sharing, Resilience, and Polish
**Covers:** #18, #41, #45
**Sessions:** 1
**Risk:** Low

**What changes:**

| # | Change | Files |
|---|--------|-------|
| 41 | WhatsApp share button on every trip: deep link with pre-formatted message | `components/brand/trip-card.tsx`, `lib/utils.ts` (add `buildShareUrl()`) |
| 18 | Group membership badge on feed cards for trips in user's groups | `components/brand/trip-card.tsx`, feed server query (join GroupMembership) |
| 45 | Offline cached feed: service worker or localStorage snapshot with "Last updated X min ago" | `app/trips/page.tsx`, new `lib/cache.ts`, optional `public/sw.js` |

**Milestone:** App is shareable, group-aware, and graceful on slow connections.

---

## Summary

| Phase | Recommendations | Sessions | Risk | Prerequisite |
|-------|----------------|----------|------|--------------|
| 1 - Design system | #3,7,8,13,14,48,49,50 | 1 | Low | None |
| 2 - Navigation | #1,2,11,12,19,20,30,38 | 1 | Medium | Phase 1 |
| 3 - Feed and cards | #4,9,22,25,29,37,46,47 | 2 | Medium | Phase 2 |
| 4 - Forms | #5,16,28,32,35,39,40 | 1 | Low-Medium | Phase 2 |
| 5 - Booking flow | #10,15,21,23,24,26,31,43,44 | 2 | High | DB wired, auth working |
| 6 - Driver tools | #6,27,34,42 | 1 | Medium | Phase 5 |
| 7 - Trust and ratings | #17,33,36 | 1 | Medium | Phase 5, Africa's Talking |
| 8 - Sharing and resilience | #18,41,45 | 1 | Low | Phase 5 |
| **Total** | **50** | **~10** | | |

## Schema changes required

Add these before Phase 6 and 7:

```prisma
model Trip {
  isAcceptingRequests Boolean @default(true)  // Phase 6 #42
}

model RatingToken {
  id        String   @id @default(cuid())
  token     String   @unique @default(cuid())
  bookingId String
  booking   Booking  @relation(fields: [bookingId], references: [id])
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## What to tackle first

Start with Phase 1. It requires zero database work, touches mostly CSS and one component,
and produces an immediate visual transformation that validates the design direction before
any logic is written.

Phase 4 (forms) can run in parallel with Phase 3 - they don't share files.
