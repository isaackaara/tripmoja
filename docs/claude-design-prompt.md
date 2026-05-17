I need a complete UI/UX design system for TripMoja, a mobile-first intercity ridesharing platform built for Kenya. Here is everything you need to produce it correctly.

---

ABOUT THE PRODUCT

TripMoja replaces chaotic WhatsApp ride coordination on the Nairobi-Nanyuki corridor. Drivers post available seats in their car. Passengers discover trips, request seats, and travel together. Think BlaBlaCar adapted for Kenya - scheduled rides, cost sharing, social trust - not Uber.

The app has two modes:
1. Public marketplace - anyone can browse and book trips from any driver.
2. Private Groups - closed circles of trusted users (neighbors, colleagues, communities) who share trips among themselves. Groups feel exactly like WhatsApp groups: you name it, share an invite link, members join, then post and browse trips within the closed group. A driver can post one trip to the public marketplace AND multiple groups at the same time, like choosing subreddits on Reddit.

Primary audience: Kenyan commuters and intercity travelers, mostly Android users, many arriving from WhatsApp.

---

BRAND COLORS

Primary blue:   #7697F5  (trust, main CTAs, active nav, headers)
Accent orange:  #EF9B5B  (pricing, highlights, warmth, secondary actions)
Accent green:   #9CF1C4  (confirmation, success states, seat availability)
Dark text:      #1A1A2E  (primary text, dark backgrounds)
Surface:        #F5F7FF  (page backgrounds, card backgrounds)
White:          #FFFFFF  (card surfaces, inputs)
Error:          #E53935  (validation, cancellation states)

---

VISUAL LANGUAGE

Rounded and warm. Not corporate, not dark, not Uber.

Border radius: 12px on cards and inputs, 20px on buttons, 24px on bottom sheet handles.
Shadows: soft, low-elevation (0 2px 8px rgba(0,0,0,0.08)) - not heavy drop shadows.
Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48px.
Padding inside cards: 16px.
Screen edge padding: 16px on mobile.

The feel should sit between BlaBlaCar (structured, trustworthy) and a warm community app (human, local, Kenyan). Optimistic. Not anxious. The photography/illustration direction is community travel: people in cars together, Kenyan landscape passing by windows, Mount Kenya in the background on the Nanyuki route.

---

TYPOGRAPHY

Font: Inter (or Geist as fallback). One family, multiple weights.

Scale:
- Display: 32px / 700 weight - hero headlines only
- H1: 26px / 600 - page titles
- H2: 20px / 600 - section headers
- H3: 17px / 600 - card titles, driver names
- Body: 15px / 400 - descriptions, body text
- Small: 13px / 400 - captions, timestamps, metadata
- Label: 12px / 500 uppercase tracking-wide - form labels, badges

High contrast always. Minimum contrast ratio 4.5:1. Designed for outdoor phone use in bright Kenyan sunlight.

---

SCREENS TO DESIGN (15 total, mobile-first at 375px width)

1. Landing / Home (logged out)
   Hero with route search bar (origin / destination / date), 3-step how-it-works strip, sample trip cards below, sticky header with logo + login button.

2. Trip Search Results
   Filter bar at top (route, date, trip type), scrollable list of Trip Cards, empty state if no results.

3. Trip Card (component used in search results and group feeds)
   Driver avatar + name + rating stars, route arrow (Nanyuki -> Nairobi), departure time, seats remaining pill, price (KES format), trip type badge (SELF DRIVE / HIRED DRIVER / TAXI).

4. Trip Detail Page
   Full trip info, large driver profile section with rating + review snippets, seats selector, "Request Seat" primary CTA button, notes section, sticky bottom bar with price + button.

5. Booking Request Flow (2 steps)
   Step 1: select number of seats, optional message to driver.
   Step 2: confirmation screen with trip summary and "Request Sent" state.

6. My Trips (driver view)
   Tab bar: Posted Trips / Booking Requests. Trip list with status badges. Pending booking requests with Accept / Decline actions.

7. My Bookings (passenger view)
   Tab bar: Upcoming / Past. Booking cards with status (Pending / Confirmed / Completed).

8. Create Trip Form
   Route selector (dropdown with Nanyuki->Nairobi and reverse), date + time picker, seats input, price input (KES), trip type selector (3 options with icons), notes textarea, group selector (multi-select: public marketplace + any groups you belong to), submit button.

9. User Profile Page
   Avatar (large), name, verification badge if verified, rating (stars + number of reviews), trip count, bio, review list below.

10. Groups Home
    Header: "My Groups", list of Group Cards (group avatar, name, member count, most recent trip), FAB button to create new group.

11. Group Detail Page
    Group header (photo, name, member avatars row, settings icon), tab bar: Trips / Members. Trips tab shows trip feed filtered to this group. Members tab shows member list with roles. Feels like a WhatsApp group info screen but with a trip feed.

12. Create Group Screen
    Group name input, description input, group photo upload, access type toggle (Invite Only / Open - request to join), Create button.

13. Group Invite Screen
    Large invite link display, copy link button, QR code option, share button. Same pattern as WhatsApp share link.

14. Auth Screens (login + register)
    Clean, minimal. Logo top center. Email + password fields. Primary CTA. "Don't have an account? Sign up" link. No social login in v1.

15. Driver Verification Screen
    Step-by-step upload: ID photo, driver's license photo, vehicle make + registration number, submit for review. Progress indicator at top.

---

COMPONENT LIBRARY

Buttons:
- Primary: solid #7697F5 fill, white text, 20px radius, 52px height, full width on mobile
- Secondary: outlined #7697F5, transparent fill
- Ghost: text only, #7697F5 color
- Danger: solid #E53935, white text (for cancel/decline actions)

Inputs:
- Text field: white fill, 1px border (#E0E0E0), 12px radius, 52px height, label above, error state in red
- Date/time picker: native mobile feel
- Dropdown: custom styled, with chevron

Badges / pills:
- OPEN: green (#9CF1C4) background, dark text
- FULL: orange (#EF9B5B) background, dark text
- CANCELLED: grey background
- SELF DRIVE / HIRED DRIVER / TAXI: blue outlined pill
- VERIFIED: small blue checkmark badge overlaid on avatar

Cards:
- Trip card: white fill, soft shadow, 12px radius, 16px padding
- Group card: white fill, soft shadow, group avatar left, name + meta right

Navigation:
- Bottom tab bar (mobile): 5 tabs - Home, Search, + (Post Trip, prominent, orange or raised), Bookings, Profile
- Top navigation: logo left, profile avatar right, back arrow when in sub-pages

Other:
- Star rating: 5 stars, orange fill (#EF9B5B) for filled stars
- Avatar: circular, with optional verified badge overlay
- Seat counter: small row of seat icons (filled vs empty)
- Route display: "Nanyuki" arrow-right "Nairobi" with icons
- Loading skeleton: grey shimmer placeholders matching card shapes
- Empty state: simple illustration + text + CTA button
- Toast notification: bottom of screen, auto-dismiss, success/error variants

---

UX CONSTRAINTS

- Every tap target minimum 44x44px (outdoor Android use, thumbs, no stylus)
- Booking flow must be completable in under 60 seconds
- Group creation must be completable in under 30 seconds (WhatsApp-speed)
- Show cached content gracefully when connection drops (loading skeletons, not blank screens)
- Price always displayed as "KES 1,200" not "$12" - Kenya shilling format throughout

---

REFERENCE APPS

BlaBlaCar: trip card structure, route display, driver trust signals. Take the information hierarchy, not the visual style.
WhatsApp: group creation flow, invite link UX, member list. Take the interaction model exactly.
Airbnb: listing detail page structure, bottom CTA bar. Take the sticky booking bar pattern.
Bolt (Kenya): bottom tab navigation pattern, mobile-first form flows. Take the density and speed.

---

DELIVERABLES NEEDED

1. Color palette tokens (with names, hex, and usage notes)
2. Typography scale (all sizes, weights, and usage context)
3. Spacing and radius scale
4. Full component library (all components listed above, default + state variants)
5. Mockups for all 15 screens at 375px width (mobile)
6. Optional: 1280px desktop layout for the landing page and trip search results

Export format: ready for web/Figma handoff with labeled layers and consistent naming.
