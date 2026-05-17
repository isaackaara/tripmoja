# TripMoja — Data Model

## Core Entities

### User
Every person on the platform is a User. Role is determined by action (creating a trip = acting as driver; requesting a seat = acting as passenger). Users can do both.

```
User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified DateTime?
  password      String    (hashed)
  phone         String?
  bio           String?
  avatarUrl     String?
  rating        Float?    (computed average from Reviews)
  tripCount     Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime? (soft delete)

  // Relations
  tripsAsDriver     Trip[]
  bookings          Booking[]
  reviewsGiven      Review[]  @relation("reviewer")
  reviewsReceived   Review[]  @relation("reviewee")
  verification      DriverVerification?
}
```

### Trip
A scheduled journey posted by a driver. Trips are the core supply unit.

```
Trip {
  id            String    @id @default(cuid())
  driverId      String
  routeId       String
  departureAt   DateTime
  origin        String    (free text pickup point, e.g. "Nanyuki Total", "Nairobi CBD")
  destination   String
  seatsTotal    Int
  seatsAvailable Int      (decremented on booking confirmation)
  pricePerSeat  Int       (KES)
  tripType      TripType  (SELF_DRIVE | HIRED_DRIVER | TAXI_RENTAL)
  notes         String?
  status        TripStatus @default(OPEN)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  cancelledAt   DateTime? (soft cancel)

  // Relations
  driver    User
  route     Route
  bookings  Booking[]
}

enum TripType { SELF_DRIVE HIRED_DRIVER TAXI_RENTAL }
enum TripStatus { OPEN FULL COMPLETED CANCELLED }
```

### Route
Canonical routes. V1 has one: Nanyuki <-> Nairobi. Directional: each direction is a separate route.

```
Route {
  id          String @id @default(cuid())
  origin      String (e.g. "Nanyuki")
  destination String (e.g. "Nairobi")
  distanceKm  Int?
  durationMin Int?   (estimated)

  trips Trip[]
}
```

Seed data:
- Nanyuki -> Nairobi
- Nairobi -> Nanyuki

### Booking
A passenger's request to join a trip. Lifecycle: PENDING -> CONFIRMED | DECLINED -> COMPLETED | CANCELLED.

```
Booking {
  id          String        @id @default(cuid())
  tripId      String
  passengerId String
  seatsBooked Int           @default(1)
  status      BookingStatus @default(PENDING)
  message     String?       (passenger note to driver)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  cancelledAt DateTime?

  // Relations
  trip      Trip
  passenger User
  reviews   Review[]
}

enum BookingStatus { PENDING CONFIRMED DECLINED COMPLETED CANCELLED }
```

### Review
Bilateral. After a trip completes, both driver and passenger can rate each other. Reviews are only visible after both submit, or after a 48-hour window if only one submits.

```
Review {
  id          String  @id @default(cuid())
  bookingId   String
  reviewerId  String  (person writing the review)
  revieweeId  String  (person being reviewed)
  rating      Int     (1-5)
  comment     String?
  createdAt   DateTime @default(now())
  revealed    Boolean  @default(false)

  // Relations
  booking   Booking
  reviewer  User @relation("reviewer")
  reviewee  User @relation("reviewee")

  @@unique([bookingId, reviewerId]) (one review per person per booking)
}
```

### DriverVerification
Optional trust upgrade. Admin reviews submitted documents and grants badge.

```
DriverVerification {
  id          String             @id @default(cuid())
  userId      String             @unique
  idDocUrl    String?
  licenseUrl  String?
  vehicleMake String?
  vehicleReg  String?
  status      VerificationStatus @default(PENDING)
  reviewedAt  DateTime?
  reviewNotes String?
  createdAt   DateTime           @default(now())

  user User
}

enum VerificationStatus { PENDING APPROVED REJECTED }
```

---

## Key Design Notes

- **Rating computation:** Recalculate `User.rating` after each new Review is revealed. Store as average on User for fast query (no join needed for listing pages).
- **Seats:** `Trip.seatsAvailable` decrements when a booking is CONFIRMED, increments if booking is CANCELLED. Never go below 0. Enforce at DB level with check constraint.
- **Soft deletes:** Use `cancelledAt` / `deletedAt` timestamps. Never hard-delete trips, bookings, or users. Audit trail matters in a trust platform.
- **Route flexibility:** The Route table allows future route expansion without schema changes. V1 seeds 2 routes only.
- **WhatsApp after confirmation:** When a booking is CONFIRMED, the platform surfaces the driver's phone number to the passenger (and vice versa) for coordination. This is the off-platform handoff moment.
