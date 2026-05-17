# Next.js 15 Feasibility Audit: UI/UX Redesign Plan

Audited against: Next.js 15.3, React 18.3, Tailwind 3.4, NextAuth v5 beta.25, Prisma 5.22.
Codebase state: skeleton live, DB not wired, all pages on mock data.

---

## Phase 1: Design System Cleanup

**Feasible: Yes**

**Issues found:**

1. The plan targets `tailwind.config.ts` for the monochrome palette change. That file is already the source of truth for color tokens. The `globals.css` CSS custom properties must stay in sync with it manually - there is no automated sync between the two files. This is an existing risk, not introduced by the plan, but the plan changes both, so the developer must touch both places for every color change.

2. Dark mode via `[data-theme=dark]` token overrides in `globals.css` is the right approach for this stack. However, the `html` element in `app/layout.tsx` does not have `data-theme` wired to any toggle or `prefers-color-scheme` media query. The plan does not include wiring the toggle mechanism. The CSS overrides will exist but be inert until something sets `data-theme=dark` on `<html>`. This is a scope hole, not a blocker, but the milestone claim ("dark mode") overstates what Phase 1 delivers.

3. The `app/(auth)/register/page.tsx` and `app/trips/new/page.tsx` targets for optional-field labelling are correct. Both files exist.

**Missing files:** None - all targets exist in the codebase.

**Corrected estimate:** 1 session is realistic. The dark mode work is minimal CSS; the blocker is the toggle mechanism is out of scope.

---

## Phase 2: Navigation Restructure

**Feasible: Yes (with one gotcha)**

**Issues found:**

1. `bottom-nav.tsx` is already a `'use client'` component (uses `usePathname`, `useRouter`). Collapsing to 3 tabs is straightforward. However, the plan replaces the raised FAB with a plain tab. The current CSS in `globals.css` has `.bottom-nav` hard-coded as `grid-template-columns: repeat(5, 1fr)`. When collapsing to 3 tabs, that CSS class must change to `repeat(3, 1fr)`. The plan does not mention `globals.css` as a target for Phase 2, but it will need to change alongside `bottom-nav.tsx`.

2. Bottom sheet dismiss on Android back (`popstate` handler) is listed here as item #30 but the bottom sheet component itself (`components/ui/bottom-sheet.tsx`) is new in Phase 3. Putting the popstate handler in Phase 2 before the sheet exists creates dead code. The handler should move to Phase 3 where the sheet is built.

3. `sessionStorage` for tab state (#38) requires the trips page to be a client component. Currently `app/trips/page.tsx` is a server component (no `'use client'` directive). Making it client-side to access `sessionStorage` would break SSR for the feed - which the architecture decisions explicitly require (Decision 4: SSR for trip listings). Correct approach: keep the server component, pass route+date as URL search params instead (e.g. `/trips?from=nanyuki&to=nairobi&date=2026-05-17`). Search params persist across navigations and are accessible in both server and client components.

**Missing files:** `globals.css` needs updating when the nav collapses to 3 tabs.

**Corrected estimate:** 1 session is realistic, but the sessionStorage decision needs to be resolved first.

---

## Phase 3: Feed and Card Interactions

**Feasible: Partially - one significant architecture issue**

**Issues found:**

1. **Bottom sheet in App Router - the critical boundary problem.** The plan calls for a bottom sheet that renders trip detail inside `app/trips/page.tsx`. The feed page is currently a server component. A bottom sheet that opens on card tap requires `useState` to track open/close state, which forces the entire `app/trips/page.tsx` to become `'use client'`. This breaks SSR for the feed (architecture Decision 4).

   Correct approach: split into a server component shell and a client component island.
   - `app/trips/page.tsx` stays server: fetches trip data, passes it as props.
   - A new `components/ui/trip-feed.tsx` (`'use client'`) receives the trip array as props, renders the cards, owns the bottom sheet open/close state.
   - The bottom sheet renders trip detail from the data already passed - no extra fetch needed.
   - The `/trips/[id]` deep link page (already server component) stays unchanged for SEO and direct links.

   This split is missing from the plan's file targets. `components/ui/trip-feed.tsx` needs to be added.

2. **Skeleton loading states (#25):** `app/trips/page.tsx` as a server component can use React `Suspense` with a `loading.tsx` file instead of a manual skeleton component. This is the Next.js 15 idiomatic approach. A `components/ui/skeleton.tsx` component is still useful (as the Suspense fallback content), but the plan should also add `app/trips/loading.tsx` as a file target.

3. **"Similar trips" and "Same route, different day" suggestions (#37, #47):** These require querying trips by route and date, which means real DB access. The plan lists these in Phase 3 but Phase 3 runs before the DB is wired (that is a Phase 5 prerequisite). These two items need to be either deferred to Phase 5 or implemented as mock-data-only stubs with a clear TODO marker.

4. **Progressive avatar loading (#46):** The `Avatar` component is currently a pure server-renderable component (no hooks). Adding image load state (`onLoad`, `onError`) requires it to become `'use client'`. That is fine but needs to be noted.

**Missing files:**
- `components/ui/trip-feed.tsx` (client island wrapping cards + bottom sheet)
- `app/trips/loading.tsx` (Suspense fallback for the feed)

**Corrected estimate:** 2 sessions is correct given the architecture split required.

---

## Phase 4: Forms and Registration

**Feasible: Yes**

**Issues found:**

1. **Registration phone-first (#16):** The current schema has `email String @unique` as a non-nullable field on `User`. The plan makes email optional in the UI, but the DB schema still requires it. NextAuth v5 with the Prisma adapter also identifies users by email in its session/account tables. Before making email truly optional in the UI, either: (a) the schema must change `email` to `String?` and the auth flow must support phone-only login, or (b) email stays required in the DB but the UI collects it in a collapsed state. Option (b) is the lower-risk path for v1. The plan does not address this schema conflict.

2. **Multi-step Create Trip (#5):** `app/trips/new/page.tsx` is already `'use client'` (uses `useState`, `useRouter`). Converting to a multi-step wizard with `useState` for step tracking is straightforward. No architecture concern.

3. **Inline validation (#39):** The project already has `react-hook-form` and `zod` in `package.json`. Use `mode: 'onChange'` in `useForm()`. No new dependencies needed.

4. **`inputMode` attributes (#32):** `app/trips/new/page.tsx` renders raw `<span>` elements for price and seats rather than real `<input>` elements. Before `inputMode` can be added, the price and seats fields need to become real inputs. This is an implicit prerequisite the plan does not state.

5. **"All form pages" target for #32 is vague.** The plan lists "all form pages" as a file target. Based on the codebase, this means: `app/(auth)/register/page.tsx`, `app/(auth)/login/page.tsx`, and `app/trips/new/page.tsx`. The login page (`app/(auth)/login/page.tsx`) is not listed explicitly anywhere else in the plan but will be touched.

**Missing files:** No new files needed, but `app/(auth)/login/page.tsx` should be listed explicitly as a target for #32 and #40.

**Corrected estimate:** 1 session is realistic.

---

## Phase 5: Booking Flow

**Feasible: Partially - swipe gesture concern, file targets incomplete**

**Issues found:**

1. **Swipe-right gesture (#15) on mobile web.** Touch event APIs (`touchstart`, `touchmove`, `touchend`) are available in browsers without any native APIs, so the gesture itself is implementable. The concerns are:
   - iOS Safari has `overscroll-behavior` and native scroll interference. A horizontal swipe on a vertically scrolling list card is ambiguous; the browser may interpret it as a scroll event before the component can claim it.
   - The threshold and velocity calculation needed to distinguish a swipe from a scroll tap requires non-trivial touch math. This is typically 3-5x more effort than it appears.
   - Users with motor disabilities or fat-finger taps will trigger accidental booking requests. A swipe-to-confirm (not swipe-to-request) with a confirmation step is safer UX.
   - **Recommendation:** Use a long-press gesture or a visible "Request" button on each card as the primary affordance, with swipe as an enhancement. The plan should note that swipe is a progressive enhancement, not the only entry point.

2. **Server actions for booking - file targets are incomplete.** The plan lists `app/api/bookings/[id]/route.ts` for phone number hiding (#23). In Next.js 15 with App Router, server actions live in separate action files or inline with `'use server'` at the top of server components. The plan mixes API route style (`route.ts`) with server action style ("server action" in the description) - they are different patterns with different calling conventions. Recommended structure:
   - `lib/actions/bookings.ts` - server actions for create, accept, decline, cancel
   - `app/api/bookings/[id]/route.ts` - REST endpoint if needed for third-party access
   The plan's file targets should list `lib/actions/bookings.ts` as a new file.

3. **"Persistent pending request banner" (#44)** on `app/trips/page.tsx` requires knowing the current user's booking state. If the feed stays a server component, this is done via a DB query at render time. If the feed becomes a client component (from Phase 3 changes), it needs a separate fetch. Either way, this requires auth to be working, which is Phase 5's prerequisite - so the ordering is correct.

4. **`lib/errors.ts` as a new file (#31):** Not listed in the plan's file column but described in the change description. Should be added explicitly.

5. **`app/bookings/[id]/page.tsx` is listed as a target** but this page does not yet exist in the codebase. It needs to be created, not modified. The plan treats it as an existing file.

6. **Driver average response time (#21):** Computing this requires aggregating timestamps across bookings. The current `Booking` model has `createdAt` (when passenger requested) but no `respondedAt` field (when driver accepted/declined). Without this field, response time cannot be calculated. A migration adding `respondedAt DateTime?` to `Booking` is an implicit prerequisite.

**Missing files:**
- `lib/actions/bookings.ts` (server actions, distinct from the API route)
- `lib/errors.ts` (error message library)
- `app/bookings/[id]/page.tsx` must be created, not modified

**Schema gap:** `Booking` model needs `respondedAt DateTime?` for driver response time calculation.

**Corrected estimate:** 2 sessions is correct. The swipe gesture alone is a half-session of careful touch event work.

---

## Phase 6: Driver Tools

**Feasible: Yes**

**Issues found:**

1. **`isAcceptingRequests` schema change placement.** The plan adds `isAcceptingRequests Boolean @default(true)` to the `Trip` model. This is correct. However, the plan says "add these before Phase 6 and 7" in the summary, but lists it only under Phase 6 in the phase table. This migration must be run before Phase 6 begins, not during. The `prisma migrate dev` step needs to be treated as a Phase 6 prerequisite task, not an inline step.

2. **`app/trips/[id]/manage/page.tsx` is a new route.** It does not exist yet. The plan correctly labels it as new. However, the middleware in `middleware.ts` does not have `/trips/[id]/manage` in its public paths list - it will correctly require auth, which is the right behavior for a driver management page.

3. **"I'm on my way" SMS (#34):** Africa's Talking SDK is not in `package.json`. It must be installed (`npm install africastalking`) before this feature can be built. This is an untracked dependency.

4. **`components/ui/driver-sheet.tsx` is listed as the target** for the verification badge (#6) and trip count (#27). This file does not currently exist. The current trip detail at `app/trips/[id]/page.tsx` renders driver info inline. The new driver sheet component is a net-new file, which is correct, but the plan should clarify that the inline driver section in `app/trips/[id]/page.tsx` may also need updating for consistency.

**Missing files:**
- No files missing from the plan's list, but Africa's Talking SDK install is an untracked prerequisite.

**Corrected estimate:** 1 session is realistic if Africa's Talking SDK integration is scoped narrowly (fire-and-forget SMS, no delivery tracking).

---

## Phase 7: Trust and Ratings

**Feasible: Partially - public rating route has a security gap**

**Issues found:**

1. **Public SMS rating route (`app/rate/[token]/page.tsx`) - security analysis.** The plan correctly identifies this as a public route requiring no login. The `RatingToken` schema has `token String @unique`, `expiresAt DateTime`, and `used Boolean`. These three fields provide:
   - Unguessability: cuid tokens are 25+ characters, effectively unguessable.
   - Expiry: prevents ratings being submitted days or weeks after a trip.
   - Single-use: `used: true` prevents double submission.

   The remaining security consideration: the token in the SMS URL is visible in the user's browser history and SMS inbox. If someone else accesses that phone, they could submit a fraudulent rating. This is an acceptable risk for v1 given the trust level of the user base (known community members). Document it, do not block on it.

   **Security gap not in the schema:** the `RatingToken` does not have a `side` field (driver or passenger). Without it, either token could be used to submit either party's rating, or you need a separate token per side. Since ratings are bilateral, two tokens per booking are needed: one for the driver to rate the passenger, one for the passenger to rate the driver. The plan's schema only describes one `RatingToken` per booking. Add a `side` field: `side String` (values: `"driver"` or `"passenger"`).

2. **Middleware and the public rating route.** The current `middleware.ts` routes public paths as `['/trips', '/how-it-works', ...]`. The `/rate/[token]/page.tsx` route must be added to the public paths list or the token-bearer will hit a redirect to `/login`. This is a missing file/change the plan does not list.

3. **Blind rating reveal (#36):** The existing `Review` model already has a `revealed Boolean @default(false)` field. This is already in the schema - the plan notes it as a feature to build but the schema work is done. Good. The logic to check "both sides submitted" and then flip `revealed = true` on both rows needs a server action, but no schema change is required.

4. **`estimateArrival()` (#33):** Estimating arrival requires either a fixed lookup table (Nanyuki to Nairobi is roughly 200km / 2.5-3.5 hours depending on traffic and trip type) or a maps API. A hard-coded lookup table keyed by `(origin, destination)` is sufficient for v1 since the corridor is fixed. The plan lists `lib/utils.ts` as the target. The `Route` model has `durationMin Int?` which is the right field to use - but it is nullable and unseeded. The utility will need a fallback value.

**Missing files:** `middleware.ts` must be updated to add `/rate` to public paths.

**Schema gap:** `RatingToken` needs a `side String` field to distinguish which party the token is for.

**Corrected estimate:** 1 session is tight. The two-token-per-booking pattern adds complexity. Budget 1.5 sessions.

---

## Phase 8: Sharing, Resilience, and Polish

**Feasible: Partially - service worker approach needs adjustment**

**Issues found:**

1. **Service worker in Next.js 15.** The plan suggests `public/sw.js` as the service worker file. This is the correct file location - Next.js serves the `public/` directory at the root, so `public/sw.js` is available at `/sw.js`. However:
   - Service workers must be registered from client-side JavaScript. In Next.js 15 App Router, there is no global client entry point. Registration must happen inside a `'use client'` component that is rendered on every page - typically a wrapper in `app/layout.tsx` or a dedicated `components/service-worker-registration.tsx` client component.
   - The plan does not list `app/layout.tsx` or a registration component as a file target. This is a missing piece.
   - `next.config.ts` may need `headers()` configuration to set the correct `Service-Worker-Allowed` header if the SW scope needs to be broader than `/`.
   - **Simpler alternative:** `localStorage` snapshot (also listed in the plan) is far easier to implement and requires no registration component, no headers config, and no scope issues. For v1 with a fixed corridor, localStorage is the correct choice. `public/sw.js` should be considered v2 scope.

2. **Group membership badge (#18):** This requires joining `GroupMembership` in the feed query. The current feed is on mock data. When real DB data is wired, this join is a potential N+1 query if not done carefully. The server query should use `include: { groups: { include: { group: { include: { memberships: true } } } } }` or a raw query. The plan does not flag this query complexity.

3. **WhatsApp share button (#41):** The `buildShareUrl()` function will construct a `whatsapp://send?text=...` URL. On desktop this opens the WhatsApp web interface; on mobile it opens the app. This works without any SDK. The Web Share API (`navigator.share()`) is an alternative that handles all share targets. Consider using `navigator.share()` with a WhatsApp fallback rather than a hard-coded WhatsApp link.

4. **Phase 8 has no prerequisite for Groups** being implemented. The group badge (#18) requires `GroupMembership` records to exist. If groups are not yet a live feature (they are currently mock-only), the badge will always be empty. The plan should note this dependency.

**Missing files:**
- `components/ui/service-worker-registration.tsx` (if SW approach is kept)
- `app/layout.tsx` modification (to include the SW registration component)

**Corrected estimate:** 1 session for WhatsApp share and localStorage cache. Service worker adds another 0.5 sessions if pursued.

---

## Critical Blockers

These are issues that would cause a phase to fail entirely or produce incorrect behavior:

**Blocker 1 - Phase 2/3: sessionStorage vs SSR conflict.**
Using `sessionStorage` for tab state in a server component breaks the architecture. Must use URL search params instead. If this is implemented as described, the page will either throw a `window is not defined` error on the server or require downgrading the entire trips page to a client component, breaking SSR.

**Blocker 2 - Phase 3: Bottom sheet requires client component island.**
The feed page cannot be both SSR (architecture requirement) and own bottom sheet open/close state. Without the server/client split described above, either SSR breaks or the bottom sheet cannot function. The `components/ui/trip-feed.tsx` client island is not optional.

**Blocker 3 - Phase 4: Email optional in UI vs required in schema.**
If Phase 4 removes email from the required fields in the registration UI without a corresponding schema migration, users who do not enter email will fail validation at the DB level (or at the NextAuth adapter level). The auth adapter expects a non-null email for user identification. This will cause silent registration failures.

**Blocker 4 - Phase 5: `app/bookings/[id]/page.tsx` does not exist.**
The plan treats this as a file to modify. It must be created. Creating vs modifying changes the implementation approach: a new page needs a route, layout consideration, and auth guard.

**Blocker 5 - Phase 5: `respondedAt` missing from Booking model.**
Driver average response time (#21) cannot be computed without a timestamp for when the driver responded. The field is not in the schema. Without it, the feature either displays nothing or displays incorrect data. A migration is required before Phase 5.

**Blocker 6 - Phase 7: `middleware.ts` not updated for public rating route.**
The rating page at `/rate/[token]` will redirect unauthenticated users to login. SMS rating links are sent to users who may not have a browser session. Without updating the middleware's public paths, the entire post-trip SMS rating feature is broken for its primary use case.

**Blocker 7 - Phase 7: `RatingToken` missing `side` field.**
With one token per booking and no `side` field, the rating submission endpoint cannot know whether to record a driver-rates-passenger review or a passenger-rates-driver review. The blind reveal logic also cannot check "both sides submitted" without knowing which side each token represents.

---

## Phase Dependency Issues

**Phase 2 item #30 (bottom sheet dismiss handler) belongs in Phase 3.** Moving popstate handler code into a component that does not yet exist creates unreachable code.

**Phase 3 items #37 and #47 (similar trips suggestions) belong in Phase 5.** They require live DB queries that are not available until Phase 5's prerequisites are met.

**Phase 6 schema migration** (`isAcceptingRequests`) is treated as an in-phase step but must happen before the phase begins (before any Phase 6 code is deployed). Mark it as a phase prerequisite task.

**Phase 8 item #18 (group badge)** depends on groups being a live feature. That dependency is not stated.

---

## Session Estimate Summary

| Phase | Plan estimate | Corrected estimate | Key adjustment |
|-------|--------------|-------------------|---------------|
| 1 - Design system | 1 | 1 | Dark mode toggle is out of scope |
| 2 - Navigation | 1 | 1.5 | sessionStorage decision must be resolved first |
| 3 - Feed and cards | 2 | 2.5 | Server/client split adds complexity |
| 4 - Forms | 1 | 1 | Email/schema conflict must be decided |
| 5 - Booking flow | 2 | 3 | Swipe gesture, missing files, `respondedAt` migration |
| 6 - Driver tools | 1 | 1.5 | Africa's Talking install + driver sheet is net-new |
| 7 - Trust and ratings | 1 | 1.5 | Two-token pattern + middleware gap |
| 8 - Sharing and resilience | 1 | 1 | Drop SW to localStorage only |
| **Total** | **~10** | **~13** | |
