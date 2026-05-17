# TripMoja

Open source intercity ridesharing for the Nanyuki-Nairobi corridor.

Passengers find a seat. Drivers fill their car. No middleman, no fees, no WhatsApp group chaos.

Built with Next.js 15, Prisma, PostgreSQL, and NextAuth.

---

## What it does

- Browse trips by route and date
- Request a seat directly from the driver
- Drivers accept or decline with one tap
- Mutual blind ratings after trip completion
- Driver verification badge (ID and driver licence)
- WhatsApp share on every trip card

## Stack

- **Frontend/Backend:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS + custom design tokens
- **Database:** PostgreSQL via [Neon](https://neon.tech) + Prisma ORM
- **Auth:** NextAuth.js v5 (email/password, phone login)
- **Email:** [Resend](https://resend.com)
- **Deployment:** Vercel

## Local setup

**Prerequisites:** Node.js 20+, a Neon (or any Postgres) database, a Resend API key.

```bash
git clone https://github.com/isaackaara/tripmoja.git
cd tripmoja
npm install
cp .env.example .env
# Fill in .env with your DATABASE_URL, AUTH_SECRET, RESEND_API_KEY
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open `http://localhost:3000`.

**Seed users** (password: `password123`):
- `alice@example.com` (driver)
- `bob@example.com` (driver)
- `carol@example.com` (passenger)

Generate `AUTH_SECRET` with:
```bash
openssl rand -base64 32
```

## Project structure

```
app/              Next.js App Router pages
components/
  brand/          Design system (Button, TripCard, Avatar, Stars...)
  ui/             Feature components (BottomSheet, TripDetail, DriverSheet...)
lib/
  actions/        Server actions (bookings, trips, ratings, auth)
  utils.ts        Shared utilities (formatKes, estimateArrival, buildShareUrl...)
  cache.ts        localStorage feed cache
  email.ts        Resend email wrappers
  trip-mapper.ts  Prisma -> frontend Trip type adapter
prisma/
  schema.prisma   Database schema
  seed.ts         Development seed data
types/            Shared TypeScript types
```

## Env vars

See `.env.example` for all required variables. All are documented with where to get them.

## Contributing

Issues and PRs welcome. This is personal infrastructure shared publicly - not a maintained open source project with a roadmap or support SLA. Use it, fork it, adapt it.

## License

MIT
