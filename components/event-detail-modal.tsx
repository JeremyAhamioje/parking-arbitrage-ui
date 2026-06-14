'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, Clock } from 'lucide-react'

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

interface EventDetailModalProps {
  eventId: string
  onClose: () => void
}

export function EventDetailModal({ eventId, onClose }: EventDetailModalProps) {
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
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-2xl w-full mx-4">
          <p className="text-slate-600 dark:text-slate-400">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 dark:text-slate-400">Event not found</p>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-4xl w-full my-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-light mb-2">{event.event.name}</h2>
            <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {event.venue.name}, {event.venue.city}, {event.venue.state}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {eventDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })} at {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Metrics */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Total Listings</p>
            <p className="text-2xl font-light">{event.totalListings}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Available Spots</p>
            <p className="text-2xl font-light">{event.totalAvailableSpots}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Avg Price</p>
            <p className="text-2xl font-light">${event.avgPrice}</p>
          </div>
        </div>

        {/* Sort Buttons */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex gap-2">
          <button
            onClick={() => setSortBy('price')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'price'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            💰 Lowest Price
          </button>
          <button
            onClick={() => setSortBy('availability')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'availability'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            🅿️ Most Available
          </button>
          <button
            onClick={() => setSortBy('walking')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              sortBy === 'walking'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            🚶 Closest Walk
          </button>
        </div>

        {/* Listings Table */}
        <div className="p-6 max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="text-left py-2 px-2 font-semibold text-slate-900 dark:text-slate-50">Facility</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-900 dark:text-slate-50">Price</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-900 dark:text-slate-50">Available</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-900 dark:text-slate-50">Type</th>
                <th className="text-left py-2 px-2 font-semibold text-slate-900 dark:text-slate-50">Distance</th>
              </tr>
            </thead>
            <tbody>
              {sortedListings.map((listing) => (
                <tr
                  key={listing.id}
                  className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <td className="py-2 px-2">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-50">{listing.facilityName}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{listing.address}</p>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <div>
                      <p className="font-semibold">${listing.totalPrice.toFixed(2)}</p>
                      <p className="text-xs text-slate-500">+${listing.serviceFee.toFixed(2)} fee</p>
                    </div>
                  </td>
                  <td className="py-2 px-2">
                    <p className="font-semibold">{listing.availableSpaces} spots</p>
                  </td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                    {listing.facilityType || 'Lot'}
                  </td>
                  <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                    {listing.walkingMeters ? (
                      `${Math.round(listing.walkingMeters / 1000 * 10) / 10}km`
                    ) : (
                      'N/A'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
