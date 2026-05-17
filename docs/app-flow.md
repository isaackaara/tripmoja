# TripMoja — App Flow

Version: 1.0
Date: 2026-05-17
Status: Approved for v1 build

This document maps every page, navigation path, user journey, and state transition in TripMoja v1.

---

## 1. Route Map

### Public routes (accessible without login)

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home / Landing | Hero, route search, sample public trips |
| `/trips` | Trip search results | Filtered by route + date query params |
| `/trips/[id]` | Trip detail | Full info, driver profile, book CTA |
| `/groups/join/[code]` | Group invite landing | Shows group preview; prompts login to join |
| `/profile/[id]` | User public profile | Rating, reviews, trip history. No login required. |
| `/auth/login` | Login | Redirects to home if already logged in |
| `/auth/register` | Register | Redirects to home if already logged in |
| `/auth/verify-email` | Email verification | Token-based; shows success or expired states |

### Authenticated routes (redirect to /auth/login if not logged in)

| Route | Page | Notes |
|-------|------|-------|
| `/trips/new` | Create trip | Requires email verified |
| `/my-trips` | My posted trips (driver view) | Tab: Active / Past |
| `/my-trips/[id]` | My trip detail | Booking requests list + confirm/decline actions |
| `/bookings` | My bookings (passenger view) | Tab: Upcoming / Past |
| `/bookings/[id]` | Booking detail | Contact reveal after CONFIRMED status |
| `/profile/settings` | Edit my profile | Name, bio, phone, avatar |
| `/profile/verify` | Submit verification | Upload docs |
| `/groups` | My groups | List of groups I'm a member of |
| `/groups/new` | Create group | Name, description, photo, access type |
| `/groups/[id]` | Group detail | Tab: Trips / Members |
| `/groups/[id]/invite` | Group invite link | Link + QR code + share button |
| `/admin/verifications` | Admin: pending list | Requires isAdmin session flag |
| `/admin/verifications/[id]` | Admin: review verification | View docs via signed URL, approve/reject |

---

## 2. Navigation Structure

### Bottom navigation bar (mobile, always visible when logged in)

```
[ Home ]  [ Search ]  [ + Post ]  [ Bookings ]  [ Profile ]
   /           /trips    /trips/new   /bookings    /profile/[me]
```

The `+ Post` tab is the primary action. It is visually elevated (colored background, center position).

### Top bar

- Logo (left) links to `/`
- Back arrow (left) on sub-pages
- Profile avatar (right) links to `/profile/settings` when logged in; shows Login button when not

### Group navigation (within a group)

- Group header with name, photo, member count
- Tab bar: `Trips | Members`
- Trips tab: group's trip feed
- Members tab: member list with roles + admin controls

---

## 3. Key User Journeys

### Journey 1: New user registers and finds a ride

```
/ (home)
  -> Clicks "Find a ride"
  -> /trips?origin=Nanyuki&destination=Nairobi&date=YYYY-MM-DD
  -> Browses trip cards
  -> Clicks a trip card
  -> /trips/[id] (trip detail)
  -> Clicks "Request a seat"
  -> Redirected to /auth/login (not logged in)
  -> Logs in or registers at /auth/register
  -> Receives verification email
  -> Clicks link in email -> /auth/verify-email?token=...
  -> Email verified
  -> Redirected back to /trips/[id]
  -> Selects seats, adds optional message, submits booking request
  -> Booking created with status PENDING
  -> Confirmation screen with booking summary
  -> Redirected to /bookings/[id]
  -> Booking status shows PENDING; waits for driver
```

### Journey 2: Driver posts a trip

```
/trips/new
  (requires: logged in + email verified)
  
  Form fields:
  - Route: dropdown [Nanyuki -> Nairobi | Nairobi -> Nanyuki]
  - Pickup point: text e.g. "Nanyuki Total"
  - Dropoff point: text e.g. "Nairobi CBD"
  - Date: date picker
  - Time: time picker
  - Seats: number input (1-8)
  - Price per seat: KES input
  - Trip type: radio [Self Drive | Hired Driver | Taxi Rental]
  - Notes: textarea (optional)
  - Visibility: multi-select
      [ ] Public marketplace  (checked by default)
      [ ] Group 1 name
      [ ] Group 2 name
      (shows only groups where user is a member)
  
  -> Submit
  -> Trip created
  -> Redirect to /my-trips/[id] (driver's trip view)
  -> Toast: "Trip posted successfully"
```

### Journey 3: Driver manages booking requests

```
/my-trips/[id]
  Sections:
  - Trip summary (route, date, seats, status)
  - Pending requests (list of passengers + seat count + message)
  - Confirmed passengers (list)
  
  For each pending request:
    [Confirm] -> Booking status: CONFIRMED
                 Seats decremented on Trip
                 Email sent to passenger with contact details
    [Decline] -> Booking status: DECLINED
                 Email sent to passenger
```

### Journey 4: Passenger receives confirmation and contacts driver

```
Email arrives:
  "Your booking is confirmed. Driver: John M. Trip: Nanyuki -> Nairobi..."
  
  -> Passenger opens /bookings/[id]
  -> Booking status: CONFIRMED
  -> Contact section now visible:
      John M. | 0712 345 678
      [Open WhatsApp] (deep link: https://wa.me/254712345678?text=Hi+John...)
  
  (Driver also sees passenger contact on /my-trips/[id] booking detail)
```

### Journey 5: Post-trip rating

```
Booking status moves to COMPLETED (manual or via admin; post-trip confirmation in v1)

2 hours after scheduled departure:
  Email to both driver and passenger:
  "How was your trip? Rate [name]"
  -> Link to /bookings/[id]#rating

/bookings/[id]:
  Rating form appears:
  - 1-5 star selector
  - Optional comment
  - Submit

  State A: Only one party has rated
    -> "Rating submitted. Waiting for the other party."
    -> Review not visible

  State B: Both parties have rated
    -> Reviews revealed immediately
    -> User.rating recalculated for both parties
    -> Reviews appear on respective profiles

  State C: 48 hours pass, only one party rated
    -> Reviews revealed regardless
    -> User.rating recalculated for the reviewee
```

### Journey 6: User submits for verification

```
/profile/[me] or /profile/settings
  -> "Get verified" CTA if not yet verified
  -> /profile/verify

/profile/verify:
  Passenger option:
    - Upload ID document (photo/PDF, max 5MB)
    - Submit
  
  Driver option:
    - Upload ID document
    - Upload driving license
    - Vehicle make (text)
    - Vehicle registration (text e.g. "KDD 123A")
    - Submit

  -> Verification record created with status PENDING
  -> Confirmation: "Your verification is under review. This usually takes 1-2 business days."

Admin at /admin/verifications:
  -> Sees pending list
  -> Clicks user
  -> /admin/verifications/[id]
  -> Clicks "View ID" -> signed URL generated -> opens doc in new tab
  -> Approves or rejects with optional notes

  On APPROVED:
    -> Verification.status = APPROVED
    -> Blob objects deleted
    -> Verification.docDeletedAt stamped
    -> User now shows badge everywhere their name appears

  On REJECTED:
    -> Same cleanup
    -> User can resubmit with corrected documents
```

### Journey 7: Create a group (WhatsApp-style)

```
/groups (my groups list)
  -> "+ Create group" button
  -> /groups/new

/groups/new:
  - Group name (required)
  - Description (optional)
  - Group photo (optional upload)
  - Access type: toggle
      [Invite Only] [Open - request to join]
  - Create group (CTA)

  -> Group created with unique inviteCode
  -> Creator added as ADMIN member automatically
  -> Redirect to /groups/[id]
  -> Toast: "Group created"
```

### Journey 8: Invite someone to a group

```
/groups/[id]/invite
  Invite link: https://tripmoja.vercel.app/groups/join/[inviteCode]
  [Copy link] [Share] [Show QR code]
  [Regenerate link] (admin only - invalidates previous link)

Recipient opens invite link -> /groups/join/[code]:

  State A: Logged in + already a member
    -> Redirect to /groups/[id]

  State B: Logged in + not a member + INVITE_ONLY group
    -> Auto-joined as MEMBER
    -> Redirect to /groups/[id]
    -> Toast: "You've joined [Group name]"

  State C: Logged in + not a member + REQUEST_TO_JOIN group
    -> Request submitted (status PENDING)
    -> Redirect to /groups/[id] with message: "Your request has been sent to the group admin"

  State D: Not logged in
    -> Group preview shown: name, description, member count
    -> CTA: "Join this group" / "Sign up to join"
    -> Login or register
    -> After auth: redirect back to /groups/join/[code]
    -> State B or C applies
```

### Journey 9: Admin approves a group join request

```
/groups/[id] (admin view)
  -> Members tab
  -> "Pending requests" section
  -> [Approve] or [Decline] for each request

  On Approve:
    -> GroupMembership.status = ACTIVE
    -> GroupMembership.joinedAt = now()
    -> Email sent to new member: "You've been approved to join [Group name]"

  On Decline:
    -> GroupMembership record deleted
    -> No email (to avoid signal that the group exists)
```

### Journey 10: Driver posts a trip to a group + public marketplace

```
/trips/new

  Visibility section (multi-select):
  [x] Public marketplace  <- checked by default
  [x] Nanyuki Neighbors   <- one of their groups
  [ ] Work Carpool        <- another group, not selected this time

  -> Submit
  -> Trip created with isPublic=true
  -> TripGroup entries created: { tripId, groupId: nanyukiNeighborsId }

  Result:
  - Trip appears in /trips (public search results)
  - Trip appears in /groups/[nanyukiNeighborsId] trip feed
  - Trip does NOT appear in Work Carpool
```

### Journey 11: Driver cancels a trip

```
/my-trips/[id]
  -> "Cancel trip" button (visible if trip is not COMPLETED)
  -> Confirmation dialog: "Are you sure? X confirmed passengers will be notified."
  -> Confirm

  -> Trip.status = CANCELLED
  -> Trip.cancelledAt = now()
  -> All CONFIRMED bookings: status = CANCELLED, cancelledAt = now()
  -> Trip.seatsAvailable restored to Trip.seatsTotal
  -> Email sent to all affected passengers: "Trip cancelled by driver"
```

### Journey 12: Passenger cancels a confirmed booking

```
/bookings/[id]
  -> "Cancel booking" button (visible if status is CONFIRMED)
  -> Confirmation dialog

  -> Booking.status = CANCELLED
  -> Booking.cancelledAt = now()
  -> Trip.seatsAvailable += Booking.seatsBooked
  -> If trip was FULL: Trip.status = OPEN
  -> Email sent to driver: "Passenger cancelled their booking"
```

---

## 4. State Machines

### Booking lifecycle

```
PENDING
  |-- driver confirms -> CONFIRMED
  |-- driver declines -> DECLINED
  |-- passenger cancels (before confirm) -> CANCELLED
  |-- trip cancelled -> CANCELLED

CONFIRMED
  |-- passenger cancels -> CANCELLED (seats restored)
  |-- trip cancelled -> CANCELLED (seats restored; email sent)
  |-- trip departs and completes -> COMPLETED (rating window opens)

COMPLETED
  |-- (terminal state; no transitions)

DECLINED
  |-- (terminal state; passenger sees this on booking detail)

CANCELLED
  |-- (terminal state; record preserved for audit)
```

### Trip lifecycle

```
OPEN
  |-- seatsAvailable reaches 0 -> FULL
  |-- driver cancels -> CANCELLED

FULL
  |-- a CONFIRMED booking is cancelled -> OPEN (seats restored)
  |-- driver cancels -> CANCELLED (all bookings cancelled)
  |-- trip departs and is marked complete -> COMPLETED

COMPLETED
  |-- (terminal state)

CANCELLED
  |-- (terminal state)
```

### Verification lifecycle

```
(none / unverified)
  |-- user submits docs -> PENDING

PENDING
  |-- admin approves -> APPROVED (docs purged)
  |-- admin rejects -> REJECTED (docs purged)

APPROVED
  |-- (badge shown everywhere name appears)
  |-- (can only be changed by admin)

REJECTED
  |-- user resubmits -> new Verification record created -> PENDING
```

### GroupMembership lifecycle

```
(no record = not a member)
  |-- INVITE_ONLY: opens invite link while logged in -> ACTIVE immediately
  |-- REQUEST_TO_JOIN: opens invite link while logged in -> PENDING

PENDING
  |-- admin approves -> ACTIVE
  |-- admin declines -> (record deleted)

ACTIVE
  |-- admin removes member -> (record deleted)
  |-- member leaves group -> (record deleted, if self-leave is added in v1.1)
```

---

## 5. Edge Cases and Guard Rules

| Scenario | Behavior |
|----------|----------|
| User tries to book their own trip | API returns 400: "You cannot book your own trip" |
| User tries to book a FULL trip | API returns 409: "No seats available" |
| User tries to book a CANCELLED trip | API returns 409: "This trip has been cancelled" |
| User submits verification twice | If PENDING or APPROVED exists, redirect to current status page. Only allow resubmit if REJECTED. |
| Invite link with invalid or expired code | /groups/join/[code] shows "This invite link is invalid or has been revoked" |
| Non-admin tries to access /admin/* | 403 response; redirect to home |
| Unverified email user tries to post or book | Redirect to /auth/verify-email with a message |
| Driver tries to book a seat on a group trip they posted | API returns 400 |
| Admin email removed from ADMIN_EMAIL env var | Session no longer has isAdmin=true; admin routes return 403 |
| Trip is in a group the passenger is not a member of | Trip is still bookable if isPublic=true. Group-only trips (isPublic=false) return 403 to non-members. |
