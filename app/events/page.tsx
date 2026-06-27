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
  discoveredAt?: string | null
  status?: 'secure-early' | 'newly-announced' | 'on-sale-now' | 'upcoming'
  daysUntilOnsale?: number | null
  onsaleTBD?: boolean
  performanceCount?: number
}

const STATUS_BADGE: Record<string, { label: string; bg: string; fg: string }> = {
  'secure-early':    { label: 'Secure early',    bg: '#fef3c7', fg: '#92400e' },
  'newly-announced': { label: 'Newly announced', bg: '#dcfce7', fg: '#166534' },
  'on-sale-now':     { label: 'On sale now',      bg: '#dbeafe', fg: '#1e40af' },
}

// "When was this discovered" — filter presets (hours) and sort options.
const DISCOVERED_SINCE = [
  { key: 'all', label: 'Any time', hours: 0 },
  { key: '1', label: 'Last hour', hours: 1 },
  { key: '24', label: 'Last 24h', hours: 24 },
  { key: '168', label: 'Last 7 days', hours: 168 },
] as const

// Exact discovery time in the viewer's timezone, e.g. "Jun 27, 3:14 AM".
function fmtDiscovered(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Compact age, e.g. "3h ago" / "2d ago" — to scan freshness at a glance.
function ageLabel(iso?: string | null) {
  if (!iso) return null
  const ms = Date.now() - new Date(iso).getTime()
  if (isNaN(ms) || ms < 0) return null
  const m = Math.floor(ms / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [since, setSince] = useState<string>('all')
  const [sort, setSort] = useState<'onsale' | 'recent'>('onsale')

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

  // Filter by discovery time + optional "recently discovered" sort. The feed is
  // small (secure-early), so this is done client-side off the discoveredAt field.
  const hours = DISCOVERED_SINCE.find((o) => o.key === since)?.hours || 0
  const cutoff = hours ? Date.now() - hours * 3600000 : 0
  const visible = events
    .filter((e) => {
      if (!cutoff) return true
      const t = e.discoveredAt ? new Date(e.discoveredAt).getTime() : NaN
      return !isNaN(t) && t >= cutoff
    })
    .sort((a, b) => {
      if (sort !== 'recent') return 0 // keep API order (soonest on-sale first)
      return new Date(b.discoveredAt || 0).getTime() - new Date(a.discoveredAt || 0).getTime()
    })

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />

      <div className="wrap" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>
          Discovered Events
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '24px', fontSize: '16px' }}>
          Events whose tickets aren’t on sale yet — your window to secure parking before they drop and demand spikes.
        </p>

        {/* Discovery-time filter + sort */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-3)', fontWeight: 600 }}>Discovered:</span>
          {DISCOVERED_SINCE.map((o) => {
            const active = since === o.key
            return (
              <button
                key={o.key}
                onClick={() => setSince(o.key)}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '6px 14px',
                  borderRadius: '999px',
                  cursor: 'pointer',
                  border: '1px solid var(--border)',
                  background: active ? 'var(--blue)' : 'var(--surface)',
                  color: active ? '#fff' : 'var(--text-2)',
                  transition: 'all 0.15s',
                }}
              >
                {o.label}
              </button>
            )
          })}
          <button
            onClick={() => setSort((s) => (s === 'recent' ? 'onsale' : 'recent'))}
            style={{
              marginLeft: 'auto',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text-2)',
            }}
          >
            Sort: {sort === 'recent' ? 'Recently discovered' : 'On-sale soonest'}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
            Loading events...
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
            {since === 'all'
              ? 'No upcoming on-sales right now. New shows will appear here as venues announce them and tickets are scheduled to drop.'
              : 'No events discovered in this window. Try widening the “Discovered” filter.'}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '24px',
            }}
          >
            {visible.map((event) => (
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
                    {event.performanceCount && event.performanceCount > 1
                      ? ` · +${event.performanceCount - 1} more date${event.performanceCount - 1 > 1 ? 's' : ''}`
                      : ''}
                  </div>
                  {(event.onSaleDate || event.onsaleTBD) && (
                    <div>
                      <strong>Tickets On Sale:</strong>{' '}
                      {event.onSaleDate
                        ? new Date(event.onSaleDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'To be announced'}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {fmtDiscovered(event.discoveredAt) && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        color: 'var(--text-3)',
                      }}
                      title={`First discovered ${fmtDiscovered(event.discoveredAt)}`}
                    >
                      <span aria-hidden>🔎</span>
                      <span>
                        Discovered {fmtDiscovered(event.discoveredAt)}
                        {ageLabel(event.discoveredAt) ? ` · ${ageLabel(event.discoveredAt)}` : ''}
                      </span>
                    </div>
                  )}

                  <div
                    style={{
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
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
