'use client'

import { useEffect, useState } from 'react'
import { Calendar, ExternalLink } from 'lucide-react'

interface Event {
  id: string
  name: string
  venue?: string
  date?: string
  time?: string
  availableSpots?: number
  avgPrice?: string
  sourceUrl?: string
}

export function TicketmasterEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`)
        const data = await res.json()
        setEvents(Array.isArray(data) ? data.slice(0, 15) : [])
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
    return <div className="text-slate-600 dark:text-slate-400">Loading events...</div>
  }

  if (events.length === 0) {
    return <div className="text-slate-600 dark:text-slate-400">No events discovered yet. Run the discovery module to find upcoming events.</div>
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-slate-900 dark:text-slate-50 flex-1">
              {event.name}
            </h3>
            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4 text-blue-500" />
              </a>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            {event.venue}
          </p>

          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{event.date}{event.time ? ` at ${event.time}` : ''}</span>
            </div>
            {event.avgPrice && (
              <div className="flex items-center gap-4">
                <span>{event.avgPrice} avg</span>
                <span>{event.availableSpots} spots</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
