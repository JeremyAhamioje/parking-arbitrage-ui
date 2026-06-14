'use client'

import { useEffect, useState } from 'react'
import { X, MapPin, Calendar } from 'lucide-react'
import { EventDetailModal } from './event-detail-modal'

interface VenueEvent {
  id: string
  name: string
  date: string
  startsAt: string
  availableSpots: number
  avgPrice: string
}

interface VenueDetailData {
  venue: {
    name: string
    city: string
    state: string
  }
  events: VenueEvent[]
}

interface VenueDetailModalProps {
  venueId: string
  venueName: string
  onClose: () => void
}

export function VenueDetailModal({ venueId, venueName, onClose }: VenueDetailModalProps) {
  const [data, setData] = useState<VenueDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/venue/${venueId}`)
        const venueData = await res.json()

        // Extract and format events
        const formattedEvents = (venueData.events || []).map((event: any) => ({
          id: event.id,
          name: event.event_name,
          date: new Date(event.starts_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          startsAt: event.starts_at,
          availableSpots: 0, // Will be populated from listings
          avgPrice: '$0.00', // Will be populated from listings
        }))

        setData({
          venue: venueData.venue || { name: venueName, city: 'Unknown', state: '' },
          events: formattedEvents,
        })
      } catch (error) {
        console.error('Failed to fetch venue details:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVenueDetails()
  }, [venueId, venueName])

  if (selectedEventId) {
    return <EventDetailModal eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-2xl w-full mx-4">
          <p className="text-slate-600 dark:text-slate-400">Loading venue details...</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 dark:text-slate-400">Venue not found</p>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 p-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-light mb-2">{data.venue.name}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4" />
              {data.venue.city}, {data.venue.state}
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Events List */}
        <div className="p-6">
          {data.events.length === 0 ? (
            <p className="text-center text-slate-600 dark:text-slate-400">No events found for this venue</p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
              {data.events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => setSelectedEventId(event.id)}
                  className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{event.name}</h4>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="w-4 h-4" />
                    {event.date}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
