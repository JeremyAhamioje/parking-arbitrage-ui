'use client'

import { useEffect, useState } from 'react'
import { Calendar, ExternalLink } from 'lucide-react'

interface Event {
  id: string
  venue_id: string
  venue_name: string
  event_name: string
  event_date: string
  source_url: string
  created_at?: string
}

export function TicketmasterEventsFeed() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ticketmaster-events`)
        if (!res.ok) throw new Error('Failed to fetch')
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
    return <div className="text-slate-600 dark:text-slate-400 py-8">Loading events...</div>
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">No events discovered yet. Run discovery to populate.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.id}
          className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm transition-all flex items-center justify-between"
        >
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="font-medium text-slate-900 dark:text-slate-50">
                {event.event_name}
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                @ {event.venue_name}
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg flex items-center gap-2 flex-shrink-0 transition-colors"
            >
              Buy Now
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      ))}
    </div>
  )
}
