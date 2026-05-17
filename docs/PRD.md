# TripMoja — Product Requirements Document (PRD)

Version: 1.0
Date: 2026-05-17
Author: Isaac Hunja / Kaara Works
Status: Approved for v1 build

---

## 1. Overview

TripMoja is an open source, mobile-first intercity ridesharing platform for Kenya, starting with the Nairobi-Nanyuki corridor. It replaces informal WhatsApp ride coordination with a structured marketplace built on social trust.

This is not a business. It is an open source portfolio project and genuine community tool, released under the MIT license. Isaac will run one live instance. Anyone else can clone and self-host for their own corridor.

---

## 2. Problem

People organizing intercity rides on the Nanyuki-Nairobi corridor do it through WhatsApp groups. Drivers post vague messages. Passengers DM privately. Payments happen off-platform. There is no verification, no reputation system, no booking confirmation, and no structured discovery.

The platform that should exist does not exist in this market. TripMoja fills that gap.

The product is not on-demand ride hailing. It is scheduled rides, seat sharing, cost splitting, and social trust - closer to BlaBlaCar than to Uber.

---

## 3. Solution

A web application where:
- Drivers post available seats on scheduled trips
- Passengers discover trips, review driver profiles, and request seats
- Drivers accept or decline requests
- Both parties rate each other after trip completion
- Private groups allow trusted circles to share trips among themselves

The platform coordinates the connection. Money moves off-platform (M-Pesa, cash, bank). The platform does not touch payments in v1.

---

## 4. Target Users

### Persona A: The Regular Commuter (primary)
Travels Nanyuki-Nairobi 2-4 times per month. Already coordinates through a WhatsApp group. Wants something faster, more organized, and with better driver accountability. Android user. Comfortable with mobile web but not apps.

### Persona B: The Sharing Driver
Drives the corridor regularly, often with empty seats. Currently posts in WhatsApp groups. Wants a better way to find passengers and build a reputation that makes future trips easier to fill.

### Persona C: The Community Organizer
Manages a group of neighbors, colleagues, or community members who travel together regularly. Wants a private coordination tool that is more structured than a WhatsApp group but does not require running a business.

---

## 5. V1 Feature Set

### 5.1 Authentication and Profiles

| Feature | Detail |
|---------|--------|
| Registration | Email and password. Confirmation email sent on signup. |
| Email verification | Required before posting trips or requesting bookings. Browse and search is allowed without verification. |
| Login | Email and password. Sessions stored in database (not JWT). |
| User profile | Name, photo, bio, rating (average of revealed reviews), trip count, verification badge. |
| Profile visibility | All profiles are publicly viewable. No private profiles. |
| Account deletion | Soft delete. User's trip history and reviews are preserved anonymously. |

### 5.2 Trip Management (Driver)

| Feature | Detail |
|---------|--------|
| Create trip | Route (Nanyuki->Nairobi or Nairobi->Nanyuki), specific pickup point, date and time, total seats, price per seat (KES), trip type, optional notes. |
| Trip visibility | Driver chooses: public marketplace (on by default), and/or one or more private groups. Multi-select. |
| Trip types | SELF_DRIVE (driver owns and drives), HIRED_DRIVER (owner hired someone), TAXI_RENTAL (rented vehicle with driver). |
| Edit trip | Allowed before any bookings are confirmed. |
| Cancel trip | Allowed at any time. All confirmed passengers are notified by email. Their bookings are cancelled and seats restored. |
| My Trips view | List of all trips posted with status, pending booking requests, confirmed passengers. |
| Booking management | Accept or decline each booking request. Declining does not affect driver rating. |

### 5.3 Trip Discovery (Passenger)

| Feature | Detail |
|---------|--------|
| Public browsing | All public trips are visible to logged-out users. |
| Search and filter | Filter by route and departure date. Sort by departure time (default). |
| Trip detail | Full trip info, driver profile with rating and reviews, seats remaining, price. |
| Trip types | Displayed on every trip card so passengers can self-select by preference. |

### 5.4 Booking Flow (Passenger)

| Feature | Detail |
|---------|--------|
| Request seat | Select number of seats, optional message to driver, submit request. Requires verified email. |
| Booking status | PENDING (awaiting driver) -> CONFIRMED or DECLINED. |
| Cancel booking | Passenger can cancel a confirmed booking. Seat is restored. Driver notified by email. |
| Contact reveal | After booking is CONFIRMED, both parties see each other's phone number and a WhatsApp deep-link on the booking detail page. |
| Booking history | My Bookings page: upcoming and past bookings with status. |

### 5.5 Ratings and Reviews

| Feature | Detail |
|---------|--------|
| Who rates whom | Both driver and passenger rate each other. Bilateral. |
| Trigger | Rating window opens when booking status moves to COMPLETED. |
| Reveal logic | Reviews are hidden until BOTH parties have submitted. If only one submits and 48 hours pass, reviews are revealed regardless. |
| Rating scale | 1 to 5 stars plus optional text comment. |
| Rating display | Average stored on User. Shown on profile, trip cards, and booking detail. |
| Effect | Ratings affect social trust and driver discoverability. No algorithmic boost or penalty in v1; pure display. |

### 5.6 Verification

| Feature | Detail |
|---------|--------|
| Who can verify | Any registered user. Passengers verify identity (ID only). Drivers verify identity and driving credentials (ID + license + vehicle). |
| Submission | User uploads documents via the profile verification page. |
| Review process | Admin reviews at /admin/verifications. Approves or rejects with optional notes. |
| PII handling | Documents stored in private Vercel Blob. Admin accesses via time-limited signed URLs (60 minutes). Documents are permanently deleted immediately after the admin decision (approve or reject). Only the badge status persists. |
| Badge display | Single blue checkmark. Appears on every surface where the user's name appears: trip cards, trip detail, booking detail, profile page. Tapping the badge shows the verification type (ID Verified or Driver Verified). |
| No reverification | If rejected, user can resubmit. If approved, status cannot be downgraded except by admin action. |

### 5.7 Groups

| Feature | Detail |
|---------|--------|
| What a group is | A closed circle of trusted users who share trips among themselves. Feels like a WhatsApp group. |
| Create group | Name, optional description, optional group photo, access type. Takes under 30 seconds. |
| Access types | INVITE_ONLY: anyone with the invite link auto-joins immediately. REQUEST_TO_JOIN: anyone with the link can request; admin approves or declines. |
| Invite link | Unique link per group. Shareable. Admin can regenerate to invalidate old link. |
| Invite flow (logged out) | Opening an invite link shows a group preview (name, description, member count). A join CTA prompts login or registration. After auth, user is auto-joined (INVITE_ONLY) or request is submitted (REQUEST_TO_JOIN). |
| Group discovery | No public group directory. All groups, regardless of access type, are only discoverable via a shared invite link. |
| Group trips | Members can post trips that appear in the group's trip feed. A trip can be posted to multiple groups simultaneously and to the public marketplace at the same time. |
| Member management | Admin can remove members, approve pending requests, and regenerate the invite link. Single admin per group (the creator). |
| Group deletion | Deletes memberships and removes group from all trip TripGroup entries. Trips themselves are not deleted; they remain in the public marketplace if isPublic=true. |

### 5.8 Notifications (Email via Resend)

| Trigger | Recipient | Content |
|---------|-----------|---------|
| Booking requested | Driver | Passenger name, seats requested, optional message, link to review |
| Booking confirmed | Passenger | Driver name, contact details, trip summary, WhatsApp link |
| Booking declined | Passenger | Driver name, trip summary, link to find alternatives |
| Booking cancelled by passenger | Driver | Passenger name, seats released |
| Trip cancelled by driver | All confirmed passengers | Trip summary, driver name, apology note |
| Trip reminder | All confirmed passengers | 24 hours before departure: driver contact, pickup point, time |
| Rating prompt | Both parties | 2 hours after scheduled departure: link to submit rating |

### 5.9 Admin

| Feature | Detail |
|---------|--------|
| Access | Determined by ADMIN_EMAIL environment variable. No DB flag. |
| Verification review | /admin/verifications lists pending submissions. Admin views signed-URL docs, approves or rejects. |
| Scope | Verification review only in v1. No user management, no trip management, no analytics dashboard. |

### 5.10 Analytics

| Feature | Detail |
|---------|--------|
| Provider | Vercel Analytics (built-in, privacy-friendly, no cookie banner required) |
| What is tracked | Page views and unique visitors by route. No user-level tracking. No event tracking in v1. |

---

## 6. Out of Scope for V1

| Feature | Reason |
|---------|--------|
| In-app payments or escrow | This is the exact risk that killed the original Trip Moja. Removed entirely. Off-platform M-Pesa is the actual user behavior. |
| Real-time chat | Phone number shared after booking confirmation. WhatsApp takes over. Adding WebSocket infrastructure adds cost and complexity. |
| SMS notifications | Africa's Talking integration planned for v1.1. Email is sufficient for launch. |
| Google OAuth login | v1.1. Email and password is sufficient to launch. |
| Push notifications | Requires native app. PWA is sufficient for the corridor audience. |
| Native mobile app | PWA behavior from Next.js serves the audience. |
| Multi-leg or complex routes | Nanyuki-Nairobi only. Density over breadth. |
| Fleet operator accounts | Business complexity. Not for v1. |
| Route expansion | Add when Nanyuki corridor is proven. The Route table supports expansion without schema changes. |
| Promoted listings | Not a business. No ads. |
| Full admin dashboard | Verification review only. Analytics, user management, and trip moderation are out. |
| Multiple group admins | Single admin (creator) in v1. |
| Recurring trip scheduling | Post per trip. Recurring templates are v1.1. |

---

## 7. Success Metric

V1 is working when:
One real driver posts a trip on the Nanyuki corridor. One real passenger finds it, requests a seat, is confirmed, travels, and both parties leave ratings for each other.

The full loop closes once. That is v1 success.

---

## 8. Non-Functional Requirements

| Requirement | Standard |
|-------------|----------|
| Mobile-first | All screens must work fully on a 375px Android viewport before desktop is considered. |
| Touch targets | Minimum 44x44px for all interactive elements. |
| Performance | Trip search results must render with SSR. No client-side waterfall for the critical discovery path. |
| Offline graceful | Show loading skeletons and cached content when connection drops. Do not show blank screens. |
| Accessibility | Minimum WCAG AA contrast ratios. Screen-reader compatible form labels. |
| Open source | No secrets committed to the repo. .env.example kept current. README covers local setup in under 5 minutes. |
| Kenya context | All prices displayed in KES. No USD. Currency format: "KES 1,200" not "KES1200". |
| No em dashes | Anywhere in UI copy, error messages, or notifications. Use hyphens or restructure. |
| No emojis in UI | Unless explicitly requested per feature. |
