export interface Venue {
  id: string
  name: string
  city: string
  state: string
  lat: number
  lon: number
  avgPrice: number
  availableSpots: number
  lastUpdated: string
}

export interface ParkingListing {
  id: string
  facilityId: string
  name: string
  address: string
  city: string
  state: string
  price: number
  availableSpaces: number
  amenities: string[]
  rating?: number
}

export interface Event {
  id: string
  name: string
  venue: string
  venueId: string
  date: string
  time: string
  description?: string
  source: 'spothero' | 'ticketmaster'
  eventUrl?: string
}

export interface PriceHistory {
  date: string
  price: number
  availableSpots: number
}

export interface Metric {
  label: string
  value: number | string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export interface Alert {
  id: string
  type: 'price_drop' | 'price_spike' | 'availability' | 'event'
  venue: string
  message: string
  value: string
  timestamp: string
  read: boolean
}
