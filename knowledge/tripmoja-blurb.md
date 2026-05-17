TripMoja is a mobile-first long-distance ridesharing platform built specifically for intercity travel in Kenya, starting with the Nairobi ↔ Nanyuki corridor.

The core problem it solves is this:

People are already organizing rides through chaotic WhatsApp groups. Drivers post vague messages like “Leaving for Nairobi at 7am, 2 seats,” passengers DM privately, payments happen off-platform, trust is weak, and there’s no reputation system, verification, booking flow, or structured discovery.

TripMoja replaces that entire workflow with a structured marketplace.

Core Product Vision
===================

Think:

*   BlaBlaCar adapted for Kenya
    
*   Uber-style UX for scheduled intercity rides
    
*   Community-driven marketplace instead of on-demand taxis
    
*   Optimized for low-trust, WhatsApp-native environments
    

The product is not “ride hailing.”

It is:

*   scheduled rides
    
*   shared travel
    
*   seat booking
    
*   social trust
    
*   cost sharing
    
*   intercity mobility
    

The emotional pitch:“Your shared journey is one click away.”

Primary Use Case
================

A driver is already traveling from Nanyuki to Nairobi.

Instead of driving alone, they list empty seats.

Passengers discover the trip, request seats, pay/coordinate, and travel together.

Initial Market
==============

Primary route:

*   Nairobi ↔ Nanyuki
    

Future expansion:

*   Nairobi ↔ Nakuru
    
*   Nairobi ↔ Eldoret
    
*   Nairobi ↔ Mombasa
    
*   Nairobi ↔ Kisumu
    
*   potentially East African regional routes later
    

Core User Types
===============

1\. Drivers
-----------

Drivers create trips and monetize empty seats.

There are 3 driver/trip types:

### A. Self Drive

“I am driving my own car.”

Typical carpooling use case.

### B. Hired Driver

“I hired someone to drive my car.”

Owner is still responsible for trip.

### C. Taxi/Rental

“I rented a vehicle with a driver.”

More commercialized.Closer to shuttle/taxi hybrid.

2\. Passengers
--------------

Passengers:

*   search routes
    
*   browse trips
    
*   review driver profiles
    
*   request seats
    
*   rate trips afterward
    

Passengers are not passive riders.They are marketplace participants with profiles and ratings.

Product Philosophy
==================

Trust First
-----------

Trust is the entire business.

Every feature should reinforce:

*   transparency
    
*   accountability
    
*   identity
    
*   predictability
    
*   safety
    

The platform should feel:

*   safer than WhatsApp
    
*   more human than Uber
    
*   more organized than Facebook groups
    

Core Features
=============

1\. User Authentication
=======================

Users create accounts using:

*   email/password
    
*   verification email flow
    

Potential future:

*   Google login
    
*   phone OTP
    

Users have:

*   profile photo
    
*   name
    
*   bio
    
*   ratings
    
*   trip history
    
*   verification badges
    

2\. Driver Verification
=======================

A premium trust feature.

Drivers can submit:

*   ID
    
*   license
    
*   vehicle details
    

Verified drivers receive:

*   badge
    
*   increased trust
    
*   higher conversion
    
*   better earning potential
    

Verification is a monetizable feature.

3\. Trip Creation
=================

Drivers can:

*   select route
    
*   choose pickup/dropoff points
    
*   choose date/time
    
*   set seat count
    
*   set price
    
*   choose trip type
    
*   add notes
    

Trips are scheduled, not real-time.

Important distinction.

4\. Trip Discovery
==================

Passengers can:

*   search routes
    
*   browse by date
    
*   filter trips
    
*   compare drivers
    

Key UX priority:finding rides must feel extremely lightweight and fast.

Almost like searching flights.

5\. Booking Flow
================

Passenger:

*   requests seat(s)
    

Driver:

*   accepts or declines
    

Then:

*   trip is confirmed
    
*   communication opens
    

Potential future:

*   in-app payments
    
*   escrow
    
*   cancellation fees
    

6\. Ratings & Reviews
=====================

Both sides rate each other.

This is critical infrastructure, not a “nice feature.”

Ratings affect:

*   trust
    
*   discoverability
    
*   booking conversion
    

SMS reminders are used post-trip to increase rating completion.

7\. Notifications
=================

Channels:

*   email
    
*   SMS
    

Used for:

*   booking requests
    
*   approvals
    
*   cancellations
    
*   reminders
    
*   rating prompts
    

Kenyan market reality:SMS matters.

Do not assume push notifications alone are enough.

8\. Mobile-First Design
=======================

The product is designed primarily for phones.

Most users will likely:

*   come from WhatsApp
    
*   use Android
    
*   have inconsistent internet
    
*   prefer simple flows
    

The UX should prioritize:

*   speed
    
*   clarity
    
*   low friction
    
*   large touch targets
    
*   minimal complexity
    

Business Model
==============

Primary Revenue
---------------

Transaction fee per booking.

Example:Passenger pays KES 1,200.TripMoja takes a percentage.

Secondary Revenue
-----------------

Verified driver subscriptions/badges.

Potential future monetization:

*   promoted listings
    
*   route sponsorships
    
*   insurance partnerships
    
*   fleet operators
    
*   premium support
    

Brand Identity
==============

TripMoja is:

*   youthful
    
*   trustworthy
    
*   modern
    
*   community-oriented
    
*   Kenyan-first
    

Brand colors:

*   Blue: #7697F5
    
*   Orange: #EF9B5B
    
*   Green: #9CF1C4
    

Visual language:

*   soft rounded UI
    
*   clean whitespace
    
*   optimistic imagery
    
*   human-centered photography
    
*   community energy
    

UX Priorities
=============

The app should feel:
--------------------

### Not corporate shuttle booking

Too stiff.

### Not Uber

Too transactional.

### Not social media chaos

Too unstructured.

Instead:A trusted travel community.

Technical Expectations
======================

The rewrite should likely support:

Frontend
--------

*   responsive web app first
    
*   mobile-first
    
*   possibly React/Next.js
    

Backend
-------

Needs strong relational data modeling for:

*   users
    
*   trips
    
*   bookings
    
*   ratings
    
*   messaging
    
*   verification workflows
    

Core entities
-------------

### Users

*   role(s)
    
*   ratings
    
*   verification status
    
*   trip history
    

### Trips

*   origin/destination
    
*   datetime
    
*   seats
    
*   pricing
    
*   trip type
    
*   driver
    

### Bookings

*   status lifecycle
    
*   passenger
    
*   seat count
    
*   payment status
    

### Reviews

*   bilateral review system
    

Important Product Constraints
=============================

1\. Simplicity wins
-------------------

The biggest competitor is:“just posting in WhatsApp.”

So every workflow must be easier than that.

2\. Trust is everything
-----------------------

A low-trust marketplace dies instantly.

Verification, ratings, transparency, and moderation are core systems.

3\. Density matters
-------------------

The platform only works if routes have enough activity.

This is not a generic global rideshare platform.

It is route-density driven.

Success Metric
==============

The product succeeds if users stop saying:

“Anyone leaving for Nairobi tomorrow?”

…and instead instinctively open TripMoja first.