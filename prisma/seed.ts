import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { addDays, addHours, setHours, setMinutes } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  const pw = await bcrypt.hash('password123', 12)

  const [alice, bob, carol] = await Promise.all([
    prisma.user.upsert({
      where:  { email: 'alice@example.com' },
      update: {},
      create: {
        name:     'Alice Wanjiku',
        email:    'alice@example.com',
        phone:    '0712000001',
        password: pw,
        rating:   4.8,
      },
    }),
    prisma.user.upsert({
      where:  { email: 'bob@example.com' },
      update: {},
      create: {
        name:     'Bob Mwangi',
        email:    'bob@example.com',
        phone:    '0712000002',
        password: pw,
        rating:   4.5,
      },
    }),
    prisma.user.upsert({
      where:  { email: 'carol@example.com' },
      update: {},
      create: {
        name:     'Carol Njeri',
        email:    'carol@example.com',
        phone:    '0712000003',
        password: pw,
        rating:   4.9,
      },
    }),
  ])

  const route = await prisma.route.upsert({
    where:  { origin_destination: { origin: 'Nanyuki', destination: 'Nairobi' } },
    update: {},
    create: { origin: 'Nanyuki', destination: 'Nairobi', distanceKm: 200, durationMin: 210 },
  })

  const returnRoute = await prisma.route.upsert({
    where:  { origin_destination: { origin: 'Nairobi', destination: 'Nanyuki' } },
    update: {},
    create: { origin: 'Nairobi', destination: 'Nanyuki', distanceKm: 200, durationMin: 210 },
  })

  const tomorrow6am = setMinutes(setHours(addDays(new Date(), 1), 6), 0)
  const tomorrow8am = setMinutes(setHours(addDays(new Date(), 1), 8), 0)
  const today3pm    = setMinutes(setHours(new Date(), 15), 0)

  await prisma.trip.createMany({
    skipDuplicates: true,
    data: [
      {
        id:             't1',
        driverId:       alice.id,
        routeId:        route.id,
        departureAt:    tomorrow6am,
        origin:         'Nanyuki',
        destination:    'Nairobi',
        seatsTotal:     4,
        seatsAvailable: 3,
        pricePerSeat:   800,
        tripType:       'SELF_DRIVE',
        notes:          'Stopping at Naro Moru and Sagana on request.',
      },
      {
        id:             't2',
        driverId:       bob.id,
        routeId:        route.id,
        departureAt:    tomorrow8am,
        origin:         'Nanyuki',
        destination:    'Nairobi',
        seatsTotal:     3,
        seatsAvailable: 1,
        pricePerSeat:   900,
        tripType:       'SELF_DRIVE',
      },
      {
        id:             't3',
        driverId:       carol.id,
        routeId:        returnRoute.id,
        departureAt:    today3pm,
        origin:         'Nairobi',
        destination:    'Nanyuki',
        seatsTotal:     5,
        seatsAvailable: 4,
        pricePerSeat:   850,
        tripType:       'HIRED_DRIVER',
        notes:          'AC vehicle. Direct route, no stops.',
      },
    ],
  })

  console.log('Seed complete.')
  console.log('Test accounts: alice@example.com, bob@example.com, carol@example.com (password: password123)')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
