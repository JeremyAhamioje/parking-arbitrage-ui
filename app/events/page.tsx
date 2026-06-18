'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'

interface Event {
  id: string
  name: string
  venue: string
  eventDate: string
  onSaleDate: string | null
  sourceUrl: string
  status?: 'secure-early' | 'newly-announced' | 'on-sale-now' | 'upcoming'
  daysUntilOnsale?: number | null
}

const STATUS_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  'secure-early':    { label: 'Secure early',    bg: '#fef3c7', fg: '#92400e' },
  'newly-announced': { label: 'Newly announced', bg: '#dcfce7', fg: '#166534' },
  'on-sale-now':     { label: 'On sale now',      bg: '#dbeafe', fg: '#1e40af' },
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${apiUrl}/api/events`)
        if (!res.ok) throw new Error('Failed to fetch events')
        const data = await res.json()
        setEvents(data || [])
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />

      <div className="wrap" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>
          Discovered Events
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '48px', fontSize: '16px' }}>
          Upcoming Ticketmaster events at your tracked venues — ranked by on-sale timing so you can secure parking before tickets drop
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
            No events found. Run event discovery to populate data.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {events.map((event) => (
              <a
                key={event.id}
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '24px',
                  boxShadow: 'var(--shadow)',
                  transition: 'box-shadow 0.25s, transform 0.25s',
                  textDecoration: 'none',
                  color: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.boxShadow = 'var(--shadow-hover)'
                  el.style.transform = 'translateY(-3px)'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.boxShadow = 'var(--shadow)'
                  el.style.transform = 'none'
                }}
              >
                {event.status && STATUS_BADGE[event.status] && (
                  <span
                    style={{
                      alignSelf: 'flex-start',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      background: STATUS_BADGE[event.status].bg,
                      color: STATUS_BADGE[event.status].fg,
                    }}
                  >
                    {STATUS_BADGE[event.status].label}
                    {event.status === 'secure-early' && event.daysUntilOnsale != null
                      ? ` · on sale in ${event.daysUntilOnsale}d`
                      : ''}
                  </span>
                )}

                <h3
                  style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    marginBottom: '4px',
                    color: 'var(--text)',
                  }}
                >
                  {event.name}
                </h3>

                <div style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Venue:</strong> {event.venue}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Event Date:</strong>{' '}
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                  {event.onSaleDate && (
                    <div>
                      <strong>Tickets On Sale:</strong>{' '}
                      {new Date(event.onSaleDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    padding: '12px',
                    background: 'var(--blue)',
                    color: '#fff',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  View on Ticketmaster →
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
