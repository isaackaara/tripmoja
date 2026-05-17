export type TripType = 'SELF_DRIVE' | 'HIRED_DRIVER' | 'TAXI_RENTAL'
export type TripStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED'
export type MemberRole = 'ADMIN' | 'MEMBER'
export type MembershipStatus = 'ACTIVE' | 'PENDING'
export type AccessType = 'INVITE_ONLY' | 'REQUEST_TO_JOIN'
export type VerificationType = 'IDENTITY' | 'DRIVER'
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Driver {
  id: string
  name: string
  initials: string
  avatarUrl?: string
  rating?: number
  tripCount?: number
  bio?: string
  verified: boolean
  verifiedType?: 'ID' | 'DRIVER'
  avatarColor?: 'blue' | 'orange' | 'green' | 'ink'
}

export interface Trip {
  id: string
  from: string
  to: string
  price: number
  departureAt: string
  when: string
  estimatedArrival?: string
  seatsLeft: number
  seatsTotal: number
  tripType: string
  full: boolean
  driver: Driver
  notes?: string
  isPublic: boolean
  status: TripStatus
}

export interface Group {
  id: string
  name: string
  emoji?: string
  color: string
  members: number
  lastActive: string
  lastTrip: string
  inviteCode?: string
}

export interface Member {
  id: string
  name: string
  initials: string
  role: string
  avatarColor: 'blue' | 'orange' | 'green' | 'ink'
  verified?: boolean
}

export type AvatarColor = 'blue' | 'orange' | 'green' | 'ink'
