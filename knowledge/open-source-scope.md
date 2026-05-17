# TripMoja — V1 Open Source Scope

## What Is V1

V1 is the minimum viable open source platform that makes TripMoja useful for the Nanyuki-Nairobi corridor without requiring Isaac to run any business operations.

A user can find a ride or offer one without Isaac doing anything.

---

## IN: V1 Ships This

| Feature | Notes |
|---------|-------|
| User registration (email + password) | Email verification required before posting or booking |
| User profiles | Name, photo, bio, rating, trip history |
| Trip creation | Route, date/time, seats, price, trip type, notes |
| Trip listing and search | Filter by route + date. Sort by departure time |
| Seat request flow | Passenger requests -> driver accepts/declines |
| Email notifications | Booking request sent to driver; acceptance/decline sent to passenger; trip reminder 24h before departure |
| Bilateral ratings | Both sides rate after trip. Ratings revealed after both submit or after 48h |
| Driver verification badge | Manual admin review of uploaded ID + license. Admin panel (simple) |
| Mobile-first responsive UI | 375px Android as design target |
| Public trip listings | Logged-out visitors can browse trips (read-only). Must log in to request |
| Nanyuki-Nairobi routes only | Both directions. No other routes |
| Open source repo | MIT license, public GitHub, `.env.example`, README with setup in under 5 min |

---

## OUT: V1 Does NOT Ship This

| Feature | Why excluded |
|---------|--------------|
| In-app payments | This is the risk that killed the original. Remove it entirely. Off-platform M-Pesa is the user behavior anyway. |
| Escrow / cancellation fees | Same as above |
| Real-time chat | WebSocket infrastructure adds complexity and cost. Phone number shared after booking confirmation - WhatsApp takes over. |
| Push notifications | Adds native app complexity. Email is sufficient for v1. SMS is v1.1. |
| Native mobile app (iOS/Android) | PWA behavior from Next.js is sufficient for the corridor audience |
| Multi-leg / complex routes | One corridor only. Density over breadth. |
| Fleet operator accounts | Business complexity. Not for v1. |
| Route expansion (Nakuru, Mombasa, etc.) | Add when the Nanyuki corridor is proven |
| Promoted listings / ads | Business model. Not a business. |
| Admin dashboard beyond verification | Keep admin surface minimal. No analytics, no user management beyond verification review. |
| SMS notifications | Africa's Talking integration planned for v1.1 |
| Google OAuth | v1.1 - email/password is sufficient to launch |

---

## V1.1 (Post-Launch Additions, No Commitment)

These are features worth adding if the platform gets traction, but are explicitly not part of the initial build:

- SMS notifications via Africa's Talking (critical for Kenyan market)
- Google OAuth login
- Admin dashboard improvements
- Route expansion (driven by community demand)
- Recurring trips (e.g. "I do this route every Friday")

---

## Open Source Philosophy

Isaac is sharing this publicly because:
1. It demonstrates what he can build (portfolio value)
2. The Nanyuki community can use it (community value)
3. Others may want to adapt it for their own corridors (reuse value)

Isaac is NOT:
- Running a business from this
- Providing customer support
- Promising uptime or maintenance
- Taking feature requests

Contributing is welcome. Issues and PRs accepted. Isaac merges when he has time.

---

## Deployment Model

Isaac will deploy one live instance at `tripmoja.co.ke` (or similar).

Anyone else can clone the repo and run their own instance for their own corridor.

The README will make self-hosting straightforward (Vercel + Neon free tier = $0/month for low traffic).
