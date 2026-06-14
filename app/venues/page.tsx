'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { VenueDetailModal } from '@/components/venue-detail-modal'
import { MapPin, DollarSign, TrendingUp } from 'lucide-react'

interface Venue {
  id: string
  name: string
  city: string
  state: string
  avgPrice: number
  availableSpots: number
  trend: 'up' | 'down' | 'neutral'
  lastUpdated: string
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState<string | null>(null)
  const [selectedVenueName, setSelectedVenueName] = useState<string>('')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/venues`)
        const data = await res.json()
        setVenues(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch venues:', error)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Group venues by name (first meaningful word)
  const groupedVenues = filteredVenues.reduce((acc, venue) => {
    const groupKey = venue.name.split(/\s+/)[0] // Get first word as group
    if (!acc[groupKey]) {
      acc[groupKey] = []
    }
    acc[groupKey].push(venue)
    return acc
  }, {} as Record<string, Venue[]>)

  const sortedGroups = Object.entries(groupedVenues).sort(([a], [b]) => a.localeCompare(b))

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-light tracking-tight mb-3">Venues</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Monitor parking across all tracked venues
          </p>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search venues by name or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Loading venues...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedGroups.map(([groupName, groupVenues]) => (
              <section key={groupName}>
                <h2 className="text-2xl font-light mb-4 text-slate-900 dark:text-slate-50">{groupName}</h2>
                <div className="space-y-3">
                  {groupVenues.map((venue) => (
              <div
                key={venue.id}
                className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-lg">{venue.name}</h3>
                  <span
                    className={`text-xs font-medium px-2 py-1 rounded ${
                      venue.trend === 'up'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : venue.trend === 'down'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {venue.trend === 'up' && '↑ Rising'}
                    {venue.trend === 'down' && '↓ Falling'}
                    {venue.trend === 'neutral' && '→ Stable'}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {venue.city}, {venue.state}
                  </div>
                  <span>Updated {venue.lastUpdated}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Avg Price
                      </p>
                      <p className="font-medium">${venue.avgPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        Available Spots
                      </p>
                      <p className="font-medium">{venue.availableSpots}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedVenueId(venue.id)
                      setSelectedVenueName(venue.name)
                    }}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {selectedVenueId && (
        <VenueDetailModal
          venueId={selectedVenueId}
          venueName={selectedVenueName}
          onClose={() => {
            setSelectedVenueId(null)
            setSelectedVenueName('')
          }}
        />
      )}
    </main>
  )
}
