'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/header'
import { MapPin, DollarSign, AlertCircle, TrendingDown, Clock } from 'lucide-react'

interface Listing {
  id: string
  facilityName: string
  address: string
  city: string
  state: string
  facilityType: string
  amenities: string[]
  advertisedPrice: number
  serviceFee: number
  totalPrice: number
  availableSpaces: number
  isAvailable: boolean
  walkingMeters?: number
  scrapedAt: string
}

interface EventDetail {
  event: {
    id: string
    name: string
    date: string
    startsAt: string
    endsAt: string
    sourceUrl?: string
  }
  venue: {
    name: string
    city?: string
    state?: string
  }
  listings: Listing[]
  totalListings: number
  avgPrice: string
  totalAvailableSpots: number
}

export default function EventDetailsPage() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'price' | 'availability' | 'walking'>('price')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/event/${eventId}`)
        const data = await res.json()
        setEvent(data)
      } catch (error) {
        console.error('Failed to fetch event details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  if (loading) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">Loading event details...</p>
        </div>
      </main>
    )
  }

  if (!event) {
    return (
      <main className="min-h-screen bg-white dark:bg-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-slate-600 dark:text-slate-400">Event not found</p>
        </div>
      </main>
    )
  }

  const eventDate = new Date(event.event.startsAt)
  const sortedListings = [...event.listings].sort((a, b) => {
    if (sortBy === 'price') return a.totalPrice - b.totalPrice
    if (sortBy === 'availability') return (b.availableSpaces || 0) - (a.availableSpaces || 0)
    if (sortBy === 'walking') return (a.walkingMeters || 0) - (b.walkingMeters || 0)
    return 0
  })

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Header */}
        <div className="mb-8 pb-8 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-4xl font-light tracking-tight mb-2">{event.event.name}</h1>
          <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {event.venue.name}, {event.venue.city}, {event.venue.state}
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' at '}
              {eventDate.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Listings</p>
              <p className="text-3xl font-light">{event.totalListings}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Available Spots</p>
              <p className="text-3xl font-light">{event.totalAvailableSpots}</p>
            </div>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Price</p>
              <p className="text-3xl font-light">${event.avgPrice}</p>
            </div>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setSortBy('price')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'price'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            💰 Lowest Price
          </button>
          <button
            onClick={() => setSortBy('availability')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'availability'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🅿️ Most Available
          </button>
          <button
            onClick={() => setSortBy('walking')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'walking'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            🚶 Closest Walk
          </button>
        </div>

        {/* Listings Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-slate-50">
                  Parking Facility
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-slate-50">
                  Price
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-slate-50">
                  Available
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-slate-50">
                  Type
                </th>
                <th className="text-left py-4 px-4 font-semibold text-slate-900 dark:text-slate-50">
                  Distance
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">
                        {listing.facilityName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {listing.address}, {listing.city}, {listing.state}
                      </p>
                      {listing.amenities.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {listing.amenities.slice(0, 2).join(', ')}
                          {listing.amenities.length > 2 && ` +${listing.amenities.length - 2}`}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        ${listing.totalPrice.toFixed(2)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        ${listing.advertisedPrice.toFixed(2)} + ${listing.serviceFee.toFixed(2)} fee
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {listing.availableSpaces || 0} spots
                        </p>
                        {!listing.isAvailable && (
                          <p className="text-xs text-red-600 dark:text-red-400">Unavailable</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {listing.facilityType || 'Lot'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {listing.walkingMeters ? (
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {Math.round(listing.walkingMeters / 1000 * 10) / 10}km
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500 dark:text-slate-500">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedListings.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              No parking listings found for this event
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
