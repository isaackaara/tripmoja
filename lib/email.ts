import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'TripMoja <onboarding@resend.dev>'
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

function isPlaceholder(email: string) {
  return email.endsWith('@tripmoja.local')
}

interface BookingEmailData {
  driverName: string
  driverEmail: string
  passengerName: string
  passengerEmail: string
  origin: string
  destination: string
  departureAt: Date
  bookingId: string
  price: number
}

export async function sendBookingRequest(data: BookingEmailData) {
  if (isPlaceholder(data.driverEmail)) return
  const manageUrl = `${BASE_URL}/trips/${data.bookingId}/manage`
  await resend.emails.send({
    from: FROM,
    to: data.driverEmail,
    subject: `${data.passengerName} wants a seat on your trip`,
    html: `
      <p>Hi ${data.driverName},</p>
      <p><strong>${data.passengerName}</strong> has requested a seat on your trip from <strong>${data.origin}</strong> to <strong>${data.destination}</strong>.</p>
      <p><a href="${manageUrl}" style="background:#7697F5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Review request</a></p>
      <p style="color:#888;font-size:12px">TripMoja · Nanyuki-Nairobi ridesharing</p>
    `,
  })
}

export async function sendBookingConfirmed(data: BookingEmailData) {
  if (isPlaceholder(data.passengerEmail)) return
  const statusUrl = `${BASE_URL}/bookings/${data.bookingId}`
  await resend.emails.send({
    from: FROM,
    to: data.passengerEmail,
    subject: `Your seat is confirmed — ${data.origin} → ${data.destination}`,
    html: `
      <p>Hi ${data.passengerName},</p>
      <p><strong>${data.driverName}</strong> confirmed your seat.</p>
      <p><strong>Route:</strong> ${data.origin} → ${data.destination}<br/>
      <strong>Price:</strong> KES ${data.price.toLocaleString()}/seat</p>
      <p><a href="${statusUrl}" style="background:#7697F5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">View booking</a></p>
      <p style="color:#888;font-size:12px">TripMoja · Nanyuki-Nairobi ridesharing</p>
    `,
  })
}

export async function sendBookingDeclined(data: BookingEmailData) {
  if (isPlaceholder(data.passengerEmail)) return
  await resend.emails.send({
    from: FROM,
    to: data.passengerEmail,
    subject: `Your seat request was declined`,
    html: `
      <p>Hi ${data.passengerName},</p>
      <p>Unfortunately ${data.driverName} couldn't take you on this trip (${data.origin} → ${data.destination}). Try another trip on TripMoja.</p>
      <p><a href="${BASE_URL}/trips" style="background:#7697F5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Find another trip</a></p>
      <p style="color:#888;font-size:12px">TripMoja · Nanyuki-Nairobi ridesharing</p>
    `,
  })
}

export async function sendRatingPrompt(opts: {
  toName: string
  toEmail: string
  otherName: string
  ratingToken: string
  origin: string
  destination: string
}) {
  if (isPlaceholder(opts.toEmail)) return
  const rateUrl = `${BASE_URL}/rate/${opts.ratingToken}`
  await resend.emails.send({
    from: FROM,
    to: opts.toEmail,
    subject: `How was your trip with ${opts.otherName}?`,
    html: `
      <p>Hi ${opts.toName},</p>
      <p>Your trip from <strong>${opts.origin}</strong> to <strong>${opts.destination}</strong> is complete. Rate your experience with ${opts.otherName}.</p>
      <p><a href="${rateUrl}" style="background:#7697F5;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block">Leave a rating</a></p>
      <p style="color:#888;font-size:12px">This link expires in 30 days.</p>
    `,
  })
}
