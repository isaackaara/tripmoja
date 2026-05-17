# Competitor UX Teardown — TripMoja Reference

**Scope:** How Kenyan intercity passengers find and book rides today.
**Lens:** Patterns to adopt, patterns to fix, patterns to never break.
**Audited against:** `docs/ui-redesign-plan.md` (50 recommendations, 8 phases)

---

## Apps and Alternatives Covered

1. Little (Ridesharing / Intercity tab)
2. Bolt Kenya (intercity offering, limited)
3. OBus / Faras (Kenyan bus booking aggregators)
4. WhatsApp group coordination (dominant informal alternative)
5. BlaBlaCar (global benchmark; referenced as the explicit inspiration)

---

## 1. Trip Discovery

### Little

Little added an intercity tab to its existing ride-hailing product. (unverified: exact tab label; the intercity feature existed in 2024.) The primary model is search-first: enter origin, destination, date, get a list of available vehicles or drivers. There is no ambient feed. You do not browse. You query.

Implication: Little users are trained to enter a destination first. Feed-first browsing is not their mental model for intercity.

### Bolt Kenya

Bolt's intercity offering in Kenya was limited and inconsistent (unverified: current availability). Where it exists, the UX mirrors Little: search by route and date. No browsing. Drivers are not identifiable individuals - they appear as vehicle categories.

### OBus / Faras

These are bus booking aggregators. OBus (unverified: current active status) lists scheduled bus departures from Nairobi CBD to upcountry destinations. The UX is transactional: pick a route, pick a date, see departures sorted by time, pick a seat number. Faras follows a similar model with more bus operator variety. (unverified: Faras current app status.)

The key pattern: departure time is the primary sort key. A trip at 6:00 AM appears before one at 11:00 AM regardless of price or seat count. Users scan by time.

### WhatsApp Groups

This is the dominant real-world alternative for the Nanyuki-Nairobi corridor. Groups have 50-500 members. Drivers post free-form messages: "Nai leo 7am saloon 2 seats 800 DM." Passengers DM privately. No booking confirmation. No cancellation policy. No rating.

The discovery model is chronological scroll - messages appear as posted. There is no search. Finding a trip posted 3 hours ago requires scrolling. Peak posting times are 5:00-9:00 AM and 4:00-7:00 PM.

Trust comes from group membership (a community admin controls who joins) and message history (a driver who has posted 100 times is trusted more than one who joined yesterday).

### BlaBlaCar (benchmark)

BlaBlaCar uses search-first entry (from/to/date) then returns a feed sorted by departure time. Filters (price, car preference, max detour) are secondary and collapsed by default. The primary view is a card list. Each card shows: time, price per seat, seats left, driver name, driver rating, car type. No further information is visible until you tap the card.

---

## 2. Trust Signals

### Little

Driver photo, name, and star rating shown before booking. Rating is an aggregate (unverified: whether it is ride-hailing only or includes intercity). Plate number shown. No trip count displayed in the intercity context.

The verification signal is the green "verified" badge on the driver profile, which means Little has ID-checked the driver. This badge is prominent before booking confirmation.

### Bolt Kenya

Similar to Little: photo, name, rating, vehicle. No trip count. Verification badge present for drivers who have completed Bolt's onboarding.

### OBus / Faras

Trust is operator-level, not driver-level. You trust "Easy Coach" or "Modern Coast," not the individual driver. No driver profiles, no driver ratings. The operator brand carries all the trust weight.

This is a critical difference from TripMoja's model. TripMoja's trust must sit on the individual driver, not a fleet brand.

### WhatsApp Groups

Trust signals are social and informal:
- Group tenure (how long this number has been in the group)
- Reply consistency (do they reply when pinged?)
- Returning passengers vouching in thread ("I've traveled with Kamau, good driver")
- Vehicle photos shared in the group
- Saved contact names (passengers add drivers they trust to their phonebook)

There is no star rating. Trust is built through repetition and social vouching.

### BlaBlaCar

The most developed trust system of the benchmark group:
- Star rating (1-5, shown to one decimal place)
- Trip count ("47 trips" shown next to rating)
- Profile completeness score (photo, bio, phone verified, email verified, ID verified)
- Mutual rating system: both sides rate, ratings hidden until both submit or 7 days pass
- "Auto-accept" flag on driver profiles for frequent travelers
- Response rate shown ("Usually responds within 1 hour")

---

## 3. Booking Confirmation UX

### Little

After booking an intercity trip: a full-screen confirmation with the driver's name, photo, vehicle plate, estimated pick-up time, and a "Call Driver" button. WhatsApp link is absent. The confirmation is styled like a receipt, not a message.

### Bolt Kenya

Similar to Little: confirmation screen with trip summary, driver details, a map pin showing pick-up point. No WhatsApp handoff.

### OBus / Faras

Confirmation is transactional: booking reference number, bus name, departure time, seat number, fare paid. An SMS with the booking reference is sent. The confirmation is a ticket, not a conversation.

### WhatsApp Groups

Confirmation does not exist as a concept. The passenger sends a DM. The driver replies "ok" or "confirmed" or sometimes nothing. The passenger has no record except the chat thread. No structured summary.

### BlaBlaCar

Confirmation is message-style but structured:
- "Your booking is confirmed" header
- Driver name, departure time, pick-up point, number of seats
- Plain-text trip summary shareable via any channel
- "Message [driver]" button (in-app chat opens)
- Add to calendar button (iOS/Android system calendar)

The language is conversational, not receipt-like. "You're all set for your trip to Nairobi on Friday."

---

## 4. What Each Gets Wrong

### Little / Bolt

**Wrong:** The UX assumes high connectivity. Full-screen maps, live driver tracking, frequent server calls. This is fine for Nairobi CBD ride-hailing. It fails for scheduled intercity where the user may book on 2G from Nanyuki.

**Wrong:** No identity transparency. You cannot see a driver's profile before booking in the same way you can on BlaBlaCar. You see a rating number but not who built it or when.

**Wrong:** On-demand mental model applied to a scheduled product. These apps are built for "I need a ride right now," not "I want to travel next Friday and need a seat." The search flow forces you to book for today by default. Changing the date is a secondary action.

### OBus / Faras

**Wrong:** Driver anonymity. The human relationship between driver and passenger, which is central to how Kenyans actually choose drivers, is invisible in the bus operator model.

**Wrong:** Static schedule. Buses depart at fixed times whether or not the driver has decided to go that day. Ridesharing's value is flexibility (depart when you want, not when the bus company says).

**Wrong:** Urban bias. Bus terminals assume you can get to a Nairobi CBD stage. Ridesharing is valuable precisely because it offers pick-up from your neighborhood, which OBus does not handle.

### WhatsApp Groups

**Wrong:** No persistence. A trip posted at 6 AM is buried under 50 messages by 9 AM. A passenger who checks their phone at noon cannot easily find available trips.

**Wrong:** No structure. "Nai leo 7am saloon 2 seats 800 DM" contains the critical information but requires parsing. Seat count, price, departure time, and direction are all in free text.

**Wrong:** No cancellation protocol. When a driver cancels (which happens), they either post "cancelled" in the group or go silent. Passengers have no protection.

**Wrong:** No ratings. A driver who leaves passengers stranded can rejoin a new group.

### BlaBlaCar

**Wrong for the Kenya market:** BlaBlaCar assumes credit card ownership and stable internet. Its payment flow is central to its trust model (money held in escrow until trip completes). TripMoja correctly removes payments from v1.

**Wrong for the Kenya market:** BlaBlaCar's registration requires email verification and a profile photo before you can book. In a market where many users have never verified an email, this is a conversion killer.

**Wrong for the Kenya market:** BlaBlaCar's confirmation language is European. "Your trip from Nanyuki to Nairobi" reads neutrally. The WhatsApp-style language in the TripMoja plan (#10 in Phase 5) is more aligned with how confirmations actually arrive on Kenyan phones.

---

## 5. Patterns Too Established to Break

These patterns appear across Little, Bolt, OBus, and BlaBlaCar. Breaking them in TripMoja would create friction.

**Sort by departure time.** Every intercity app sorts trips by when they leave, ascending. Do not default to price or seat count. Travelers think in terms of "I want to leave in the morning," not "I want the cheapest trip." This is established behavior.

**Orange or green for CTAs.** Little uses green. Bolt uses green. OBus uses orange variants. These are the "go" colors in the Kenyan market. TripMoja's orange CTA (#7 in Phase 1) aligns with this convention. Do not make the primary booking button blue or grey.

**Driver photo before booking.** Every app with individual drivers (Little, Bolt, BlaBlaCar) shows a driver photo prominently before the booking is confirmed. Absence of a photo is a trust red flag in this market. This is not a nice-to-have.

**Phone number after confirmation.** Little and Bolt reveal driver contact only after booking. BlaBlaCar's in-app chat serves the same purpose. Showing a phone number publicly before booking invites off-platform coordination that bypasses the rating system. Phase 5 recommendation #23 (hide driver phone until booking accepted) is the correct pattern.

**Departure time as the lead.** BlaBlaCar, Little, OBus: the time the trip leaves is always the first thing shown on a trip card. Price is secondary. Phase 1 recommendation #3 (strip TripCard to time, seats, price, driver name + rating) puts time first, which is correct.

**SMS as the reliable channel.** Not email. Not push notification. Every Kenyan transport service that sends confirmations sends an SMS. Resend (email) is fine for v1 but Africa's Talking (SMS) should be prioritized above it, not added as an afterthought. The user's email may be unmonitored; their Safaricom number is not.

---

## Key Implications for TripMoja Plan

1. **Phase 2 recommendation #1 (feed defaults to today's corridor trips) is correct, but the feed needs a search entry point pinned above it.** WhatsApp group users scan for what is available now, not what is available in general. Little and OBus users are trained to query by destination first. Phase 3 recommendation #9 (sticky compact search bar above feed) addresses this - it is a higher priority than it looks. It should be the first thing built in Phase 3, not just one of eight items.

2. **Phase 1 recommendation #3 (strip TripCard to 4 elements) aligns with BlaBlaCar's proven card format.** Do not add elements back. Every app that has reduced card density has improved conversion. Resist the urge to show vehicle make, trip notes preview, or pickup neighborhood on the card itself. Those belong in the bottom sheet (Phase 3 recommendation #4).

3. **Phase 4 recommendation #16 (phone + name + password only, email optional) is the right call for the Kenyan market.** BlaBlaCar's email-first registration is a known friction point outside Europe. Little and Bolt use phone number as the primary identifier. TripMoja must match this expectation. Email should be collected for notification purposes but not required to activate an account.

4. **Phase 5 recommendation #10 (WhatsApp-style booking confirmation language) is a genuine differentiator.** No current app in the Kenya intercity market writes confirmation copy in the register that Kenyans actually communicate in. The OBus ticket is a PDF. The Little confirmation is a receipt. WhatsApp-style language ("You're booked. John will pick you up at 7:00 AM from Nanyuki Showground.") is the correct approach and should be carried through email notifications too, not just the in-app screen.

5. **Phase 6 recommendation #27 (trip count on driver profile) is a direct import from BlaBlaCar and should be treated as a trust primitive, not a nice-to-have.** In the absence of social vouching (which WhatsApp groups provide naturally), trip count is the closest proxy for "I have done this before and passengers have trusted me." It belongs on the TripCard itself (#3), not only in the bottom sheet. Consider exposing it at card level as "47 trips" alongside the rating star.

6. **Phase 7 recommendation #17 (post-trip SMS rating link) addresses the single biggest gap in WhatsApp-native trust.** WhatsApp group trust relies on memory and social vouching. TripMoja's rating system only works if ratings are actually collected. Email rating prompts will get low response rates in this market. The SMS rating link is not a v1.1 enhancement - it is the mechanism that makes the entire bilateral rating system (Phase 7 recommendation #36) function in practice. Deprioritizing it risks shipping a rating feature that no one actually uses.

7. **Phase 8 recommendation #41 (WhatsApp share button on every trip) is the most important distribution mechanism in v1.** TripMoja's competition for discovery is WhatsApp groups. The way to capture that audience is to make it trivially easy for a driver to share their TripMoja listing into the same WhatsApp groups they already use. A well-formatted deep link shared in a group ("John is driving Nanyuki to Nairobi Sat 7 AM - 3 seats - book here: tripmoja.co.ke/trips/abc123") competes directly with the informal "DM me" post. This is a growth channel, not a polish item.

8. **No app in this market has solved the offline or low-connectivity problem for intercity booking.** Phase 8 recommendation #45 (offline cached feed) is a genuine gap in the market. Little and Bolt require active connectivity. OBus's PDF ticket is the closest thing to offline resilience. A cached feed with a clear "Last updated 14 min ago" stamp would be a meaningful trust signal on a Nanyuki-Nairobi journey where the network drops between towns. Do not skip this.

---

*Audit based on training knowledge of the Kenya market (2023-2025). Claims marked (unverified) should be confirmed against live app testing before being treated as fact. No specific metric or percentage was invented.*
