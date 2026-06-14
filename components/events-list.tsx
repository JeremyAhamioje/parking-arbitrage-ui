'use client'

import { useEffect, useState } from 'react'
import { Calendar, MapPin, TrendingUp, X } from 'lucide-react'
import { EventDetailModal } from './event-detail-modal'

interface Event {
  id: string
  name: string
  venue: string
  date: string
  time: string
  availableSpots: number
  avgPrice: string
  trend: 'up' | 'down' | 'neutral'
}

export function EventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
        const data = await res.json()
        setEvents(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-slate-600 dark:text-slate-400">Loading events...</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              No upcoming events detected
            </p>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{event.name}</h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    event.trend === 'up'
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  }`}
                >
                  {event.trend === 'up' ? '↑ Prices rising' : '↓ Prices falling'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-3">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.venue}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {event.date} at {event.time}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Available spots
                  </p>
                  <p className="font-medium">{event.availableSpots}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Avg price
                  </p>
                  <p className="font-medium">{event.avgPrice}</p>
                </div>
                <button
                  onClick={() => setSelectedEventId(event.id)}
                  className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedEventId && (
        <EventDetailModal eventId={selectedEventId} onClose={() => setSelectedEventId(null)} />
      )}
    </>
  )
}
