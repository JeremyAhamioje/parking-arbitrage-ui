'use client'

import { useEffect, useMemo, useState } from 'react'

// ---- Shapes returned by GET /api/event-stats ----

interface EventFacility {
  facilityId: string
  facilityName: string
  eventAvgPrice: number
  minPrice: number
  maxPrice: number
  latestPrice: number
  volatility: number
  obsCount: number
  baselinePrice: number | null
  premiumPct: number | null
  latestSpaces: number | null
  minSpaces: number | null
  spacesDelta: number | null
  scrapeCount: number
}

interface EventRow {
  eventId: string
  venueId: string
  eventName: string
  eventDate: string | null
  startsAt: string | null
  sourceUrl: string | null
  eventAvgPrice: number
  minPrice: number
  maxPrice: number
  spreadPct: number
  volatility: number
  multiScrape: boolean
  baselineAvgPrice: number | null
  premiumPct: number | null
  facilityCount: number
  scrapeCount: number
  firstScrapedAt: string
  lastScrapedAt: string
  cheapestFacility: string | null
  cheapestPrice: number | null
  priciestFacility: string | null
  priciestPrice: number | null
  roiLabel: 'High' | 'Medium' | 'Low' | string
  roiScore: number
  reasons: string[]
  facilities: EventFacility[]
}

interface VenueRow {
  id: string
  name: string
  eventCount: number
  avgPremiumPct: number | null
  maxPremiumPct: number | null
  peakVolatility: number
  highRoiCount: number
  totalScrapes: number
  events: EventRow[]
}

type SortKey = 'name' | 'eventCount' | 'maxPremium' | 'peakVolatility' | 'highRoi'

// Gemini's interpretation of an event's signals (GET /api/event-sentiment/:id)
interface SentimentData {
  sentiment?: 'Bullish' | 'Neutral' | 'Bearish' | string
  confidence?: number | null
  headline?: string
  narrative?: string
  recommendedPlay?: string
  keyDrivers?: string[]
  riskCaveats?: string[]
  modelId?: string
  generatedAt?: string
  cached?: boolean
  stale?: boolean | SentimentData | null
  notGenerated?: boolean
  configured?: boolean
}

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

function fmtDate(iso: string | null) {
  if (!iso) return 'TBA'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return 'TBA'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// ROI palette — High = hot (red), the strongest arbitrage opportunity.
function roiColor(label: string) {
  if (label === 'High') return 'var(--red)'
  if (label === 'Medium') return 'var(--yellow)'
  return 'var(--green)'
}

function volColor(v: number) {
  if (v >= 0.4) return 'var(--red)'
  if (v >= 0.15) return 'var(--yellow)'
  if (v > 0) return 'var(--green)'
  return 'var(--text-3)'
}

// Sentiment is a demand/arbitrage call: Bullish = buy/lock early (green),
// Bearish = wait (red), Neutral = mixed (yellow).
function sentimentColor(s?: string) {
  if (s === 'Bullish') return 'var(--green)'
  if (s === 'Bearish') return 'var(--red)'
  return 'var(--yellow)'
}
function sentimentIcon(s?: string) {
  if (s === 'Bullish') return '▲'
  if (s === 'Bearish') return '▼'
  return '◆'
}

function RoiBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 700,
        color: '#fff',
        background: roiColor(label),
        whiteSpace: 'nowrap',
      }}
    >
      {label === 'High' && <span>🔥</span>}
      {label} ROI
    </span>
  )
}

function PremiumCell({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>pending</span>
  const up = pct > 0
  return (
    <span style={{ color: up ? 'var(--green)' : 'var(--text-2)', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {up ? '▲ ' : pct < 0 ? '▼ ' : ''}{up ? '+' : ''}{pct.toFixed(0)}%
    </span>
  )
}

// Temporal volatility — only meaningful once an event has been re-scraped.
// Until then we say "new" rather than a misleading 0%.
function VolCell({ vol, multiScrape }: { vol: number; multiScrape: boolean }) {
  if (!multiScrape) {
    return (
      <span title="Single scrape so far — run-over-run volatility appears once this event is re-scraped" style={{ fontSize: '12px', color: 'var(--text-3)', fontStyle: 'italic' }}>
        new
      </span>
    )
  }
  return <span style={{ fontSize: '13px', fontWeight: 600, color: volColor(vol) }}>{(vol * 100).toFixed(0)}%</span>
}

// `source` scopes the table to one platform (spothero | parkwhiz | way). Omit it
// on the SpotHero page to show all platforms blended (the original behaviour).
export function EventPriceTrendsTable({ source }: { source?: string } = {}) {
  const [venues, setVenues] = useState<VenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('highRoi')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const run = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const qs = source ? `?source=${encodeURIComponent(source)}` : ''
        const res = await fetch(`${apiUrl}/api/event-stats${qs}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
        setMessage(data.message || null)
      } catch (e) {
        console.error('event-stats fetch failed:', e)
        setError('Could not load event price data.')
        setVenues([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [source])

  const toggle = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const setSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc')
    }
  }

  const rows = useMemo(() => {
    let r = venues
    if (query.trim()) {
      const q = query.toLowerCase()
      r = r.filter(
        v =>
          v.name.toLowerCase().includes(q) ||
          v.events.some(e => e.eventName?.toLowerCase().includes(q))
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...r].sort((a, b) => {
      let av: number | string
      let bv: number | string
      switch (sortKey) {
        case 'name': av = a.name; bv = b.name; break
        case 'eventCount': av = a.eventCount; bv = b.eventCount; break
        case 'maxPremium': av = a.maxPremiumPct ?? -Infinity; bv = b.maxPremiumPct ?? -Infinity; break
        case 'peakVolatility': av = a.peakVolatility; bv = b.peakVolatility; break
        default: av = a.highRoiCount; bv = b.highRoiCount
      }
      if (typeof av === 'string') return av.localeCompare(bv as string) * dir
      return ((av as number) - (bv as number)) * dir
    })
  }, [venues, query, sortKey, sortDir])

  const th: React.CSSProperties = {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-2)',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    cursor: 'pointer',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  }
  const td: React.CSSProperties = {
    padding: '14px 16px',
    fontSize: '14px',
    color: 'var(--text)',
    borderTop: '1px solid var(--border)',
  }
  const arrowFor = (key: SortKey) => (sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '')

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        Loading event table…
      </div>
    )
  }

  if (error || venues.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        {error || message || 'No event-context pricing yet. Run the scraper on a venue with a resolved destination_id to capture event-day prices.'}
      </div>
    )
  }

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search venue or event…"
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text)',
            fontSize: '14px',
            outline: 'none',
          }}
        />
        <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
          {rows.length} venue{rows.length === 1 ? '' : 's'} with event data · sorted by{' '}
          <strong style={{ color: 'var(--text)' }}>{sortKey === 'highRoi' ? 'high-ROI events' : sortKey === 'peakVolatility' ? 'peak volatility' : sortKey === 'maxPremium' ? 'max premium' : sortKey}</strong>
        </span>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr style={{ background: 'var(--surface-2)' }}>
                <th style={{ ...th, width: '34px' }}></th>
                <th style={th} onClick={() => setSort('name')}>Venue{arrowFor('name')}</th>
                <th style={th} onClick={() => setSort('eventCount')}>Events{arrowFor('eventCount')}</th>
                <th style={th} onClick={() => setSort('highRoi')}>High-ROI{arrowFor('highRoi')}</th>
                <th style={th} onClick={() => setSort('maxPremium')}>Top Premium{arrowFor('maxPremium')}</th>
                <th style={th} onClick={() => setSort('peakVolatility')}>Peak Volatility{arrowFor('peakVolatility')}</th>
                <th style={th}>Scrapes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => (
                <VenueFragment
                  key={v.id}
                  venue={v}
                  isOpen={expanded.has(v.id)}
                  onToggle={() => toggle(v.id)}
                  td={td}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-2)' }}>
        <span><strong style={{ color: 'var(--text)' }}>Premium</strong> = how much pricier parking gets for this specific event vs the lot&apos;s normal-day baseline (the buy signal)</span>
        <span><strong style={{ color: 'var(--text)' }}>ROI</strong> = blended premium + volatility. Expand an event to see exactly why, straight from scrape data</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }} /> High</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--yellow)' }} /> Medium</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }} /> Low</span>
      </div>
    </div>
  )
}

function VenueFragment({
  venue,
  isOpen,
  onToggle,
  td,
}: {
  venue: VenueRow
  isOpen: boolean
  onToggle: () => void
  td: React.CSSProperties
}) {
  return (
    <>
      <tr onClick={onToggle} style={{ cursor: 'pointer', background: isOpen ? 'var(--bg-band-2)' : 'transparent' }}>
        <td style={{ ...td, textAlign: 'center', color: 'var(--text-2)' }}>{isOpen ? '▾' : '▸'}</td>
        <td style={{ ...td, fontWeight: 600 }}>{venue.name}</td>
        <td style={td}>{venue.eventCount}</td>
        <td style={td}>
          {venue.highRoiCount > 0 ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#fff', background: 'var(--red)' }}>
              🔥 {venue.highRoiCount}
            </span>
          ) : (
            <span style={{ color: 'var(--text-3)' }}>0</span>
          )}
        </td>
        <td style={td}><PremiumCell pct={venue.maxPremiumPct} /></td>
        <td style={td}>
          {venue.peakVolatility > 0 ? (
            <span style={{ fontSize: '13px', fontWeight: 600, color: volColor(venue.peakVolatility) }}>
              {(venue.peakVolatility * 100).toFixed(0)}%
            </span>
          ) : (
            <span title="No re-scraped events yet — temporal volatility appears once events are scraped more than once" style={{ color: 'var(--text-3)' }}>—</span>
          )}
        </td>
        <td style={{ ...td, color: 'var(--text-2)' }}>{venue.totalScrapes}</td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={7} style={{ padding: 0, background: 'var(--bg-band-2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 16px 20px 50px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '880px' }}>
                <thead>
                  <tr>
                    {['', 'Event', 'Date', 'Avg Price', 'Baseline', 'Premium', 'Spread', 'Volatility', 'ROI', 'Scrapes'].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venue.events.map(e => (
                    <EventRowItem key={e.eventId} event={e} />
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// One event. Click to reveal the scrape-derived "why" panel + per-lot breakdown.
function EventRowItem({ event: e }: { event: EventRow }) {
  const [open, setOpen] = useState(false)
  const cell: React.CSSProperties = { padding: '12px', fontSize: '13px', borderTop: '1px solid var(--border)' }

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <td style={{ ...cell, textAlign: 'center', color: 'var(--text-2)', width: '28px' }}>{open ? '▾' : '▸'}</td>
        <td style={cell}>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{e.eventName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{e.facilityCount} lot{e.facilityCount === 1 ? '' : 's'} tracked</div>
        </td>
        <td style={{ ...cell, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmtDate(e.startsAt || e.eventDate)}</td>
        <td style={{ ...cell, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{money(e.eventAvgPrice)}</td>
        <td style={{ ...cell, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{money(e.baselineAvgPrice)}</td>
        <td style={cell}><PremiumCell pct={e.premiumPct} /></td>
        <td style={cell}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)' }}>{e.spreadPct.toFixed(0)}%</span>
        </td>
        <td style={cell}><VolCell vol={e.volatility} multiScrape={e.multiScrape} /></td>
        <td style={cell}><RoiBadge label={e.roiLabel} /></td>
        <td style={{ ...cell, color: 'var(--text-2)' }}>{e.scrapeCount}</td>
      </tr>

      {open && (
        <tr>
          <td colSpan={10} style={{ padding: 0, background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '16px 16px 22px 48px' }}>
              {/* Headline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text)', margin: 0 }}>{e.eventName}</h4>
                <RoiBadge label={e.roiLabel} />
                <span style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                  {fmtDate(e.startsAt || e.eventDate)}
                </span>
                {e.sourceUrl && (
                  <a href={e.sourceUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'var(--blue)', textDecoration: 'none' }}>
                    source ↗
                  </a>
                )}
              </div>

              {/* Why panel — the LLM-facing explanation, grounded in scrape numbers */}
              <div style={{ padding: '14px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--red) 7%, var(--surface))', border: '1px solid var(--border)', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, marginBottom: '10px' }}>
                  Why this is {e.roiLabel === 'High' ? 'a high-ROI event' : `a ${e.roiLabel.toLowerCase()}-ROI event`} — from scrape data
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {e.reasons.map((r, i) => (
                    <li key={i} style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.5 }}>{r}</li>
                  ))}
                </ul>
              </div>

              {/* AI sentiment — Gemini's interpretation of the signals above */}
              <SentimentPanel eventId={e.eventId} />

              {/* Key metric strip */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <Metric label="Event avg" value={money(e.eventAvgPrice)} />
                <Metric label="Baseline" value={money(e.baselineAvgPrice)} />
                <Metric
                  label="Premium"
                  value={e.premiumPct === null ? 'pending' : `${e.premiumPct > 0 ? '+' : ''}${e.premiumPct.toFixed(0)}%`}
                  color={e.premiumPct !== null && e.premiumPct > 0 ? 'var(--green)' : undefined}
                />
                <Metric label="Lot spread" value={`${money(e.minPrice)}–${money(e.maxPrice)}`} />
                <Metric
                  label="Volatility"
                  value={e.multiScrape ? `${(e.volatility * 100).toFixed(0)}%` : 'new'}
                  color={e.multiScrape ? volColor(e.volatility) : 'var(--text-3)'}
                />
                <Metric label="Window" value={`${fmtTime(e.firstScrapedAt)} → ${fmtTime(e.lastScrapedAt)}`} small />
              </div>

              {/* Per-lot breakdown */}
              <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                Lot-by-lot during this event · {e.facilities.length} lot{e.facilities.length === 1 ? '' : 's'}
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '620px' }}>
                <thead>
                  <tr>
                    {['Parking Lot', 'Event Avg', 'Baseline', 'Premium', 'Range', 'Vol', 'Spaces', 'Scrapes'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {e.facilities.map(f => (
                    <tr key={f.facilityId} style={{ borderTop: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{f.facilityName}</td>
                      <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{money(f.eventAvgPrice)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{money(f.baselinePrice)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px' }}><PremiumCell pct={f.premiumPct} /></td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{money(f.minPrice)}–{money(f.maxPrice)}</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', fontWeight: 600, color: volColor(f.volatility) }}>{(f.volatility * 100).toFixed(0)}%</td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                        {f.latestSpaces ?? '—'}
                        {f.spacesDelta !== null && f.spacesDelta !== 0 && (
                          <span style={{ color: f.spacesDelta > 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6, fontSize: '11px' }}>
                            ({f.spacesDelta > 0 ? '+' : ''}{f.spacesDelta})
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)' }}>{f.scrapeCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function Metric({ label, value, color, small }: { label: string; value: string; color?: string; small?: boolean }) {
  return (
    <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--surface)', border: '1px solid var(--border)', minWidth: '90px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: small ? '12px' : '15px', fontWeight: 700, color: color || 'var(--text)', marginTop: '2px' }}>{value}</div>
    </div>
  )
}

// AI sentiment read for one event. Passively loads any cached result on mount
// (cachedOnly=1 → no model spend); the user generates/refreshes explicitly.
function SentimentPanel({ eventId }: { eventId: string }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  const [data, setData] = useState<SentimentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const r = await fetch(`${apiUrl}/api/event-sentiment/${eventId}?cachedOnly=1`)
        const j = await r.json()
        if (alive) setData(j)
      } catch {
        if (alive) setErr('Could not reach the sentiment service.')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [eventId, apiUrl])

  const generate = async (refresh = false) => {
    setGenerating(true)
    setErr(null)
    try {
      const r = await fetch(`${apiUrl}/api/event-sentiment/${eventId}${refresh ? '?refresh=1' : ''}`)
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Generation failed')
      setData(j)
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  // Resolve the read to show: a fresh one, or a stale one behind a "data moved" flag.
  const staleObj = data && typeof data.stale === 'object' ? (data.stale as SentimentData) : null
  const read: SentimentData | null =
    data && !data.notGenerated && data.sentiment ? data : staleObj && staleObj.sentiment ? staleObj : null
  const isStale = !!read && read !== data
  const notConfigured = data?.configured === false

  const wrap: React.CSSProperties = {
    padding: '16px',
    borderRadius: '12px',
    background: read
      ? `color-mix(in srgb, ${sentimentColor(read.sentiment)} 8%, var(--surface))`
      : 'var(--surface)',
    border: `1px solid ${read ? `color-mix(in srgb, ${sentimentColor(read.sentiment)} 30%, var(--border))` : 'var(--border)'}`,
    marginBottom: '16px',
  }
  const btn: React.CSSProperties = {
    padding: '6px 14px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'var(--blue)',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 600,
    cursor: generating ? 'wait' : 'pointer',
    opacity: generating ? 0.7 : 1,
  }

  return (
    <div style={wrap}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: read ? '12px' : '8px' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span aria-hidden>✨</span> AI Sentiment
        </span>
        {read && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 11px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: '#fff', background: sentimentColor(read.sentiment) }}>
            {sentimentIcon(read.sentiment)} {read.sentiment}
          </span>
        )}
        {read?.confidence != null && (
          <span title="Model confidence" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-2)' }}>
            <span style={{ width: 54, height: 6, borderRadius: 4, background: 'var(--border)', overflow: 'hidden', display: 'inline-block' }}>
              <span style={{ display: 'block', height: '100%', width: `${Math.round((read.confidence || 0) * 100)}%`, background: sentimentColor(read.sentiment) }} />
            </span>
            {Math.round((read.confidence || 0) * 100)}%
          </span>
        )}
        <span style={{ flex: 1 }} />
        {read?.modelId && (
          <span style={{ fontSize: '10px', color: 'var(--text-3)' }}>
            {read.modelId}{read.cached ? ' · cached' : ''}
          </span>
        )}
        {!notConfigured && (
          <button style={btn} disabled={generating} onClick={() => generate(!!read)}>
            {generating ? 'Analyzing…' : read ? 'Refresh' : 'Generate'}
          </button>
        )}
      </div>

      {/* Stale banner */}
      {isStale && (
        <div style={{ fontSize: '12px', color: 'var(--yellow)', marginBottom: '10px', fontWeight: 600 }}>
          ⚠ Prices have moved since this read — Refresh to re-analyze.
        </div>
      )}

      {/* Body */}
      {read ? (
        <>
          {read.headline && (
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', lineHeight: 1.35 }}>{read.headline}</div>
          )}
          {read.narrative && (
            <p style={{ fontSize: '13.5px', color: 'var(--text)', lineHeight: 1.55, margin: '0 0 12px' }}>{read.narrative}</p>
          )}
          {read.recommendedPlay && (
            <div style={{ padding: '10px 13px', borderRadius: '9px', background: 'var(--surface)', border: '1px solid var(--border)', marginBottom: '12px' }}>
              <span style={{ fontSize: '10px', color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700 }}>▶ Recommended play</span>
              <div style={{ fontSize: '13.5px', color: 'var(--text)', marginTop: '4px', lineHeight: 1.5 }}>{read.recommendedPlay}</div>
            </div>
          )}
          {!!read.keyDrivers?.length && (
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: read.riskCaveats?.length ? '12px' : 0 }}>
              {read.keyDrivers.map((d, i) => (
                <span key={i} style={{ fontSize: '11.5px', color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '6px', padding: '3px 9px' }}>{d}</span>
              ))}
            </div>
          )}
          {!!read.riskCaveats?.length && (
            <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)', fontWeight: 600 }}>Watch-outs: </span>
              {read.riskCaveats.join(' · ')}
            </div>
          )}
        </>
      ) : loading ? (
        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>Checking for an AI read…</div>
      ) : notConfigured ? (
        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
          Set <code style={{ color: 'var(--text)' }}>GEMINI_API_KEY</code> on the API to enable AI sentiment.
        </div>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
          Have Gemini interpret these scrape signals into a demand read + arbitrage play.
        </div>
      )}

      {err && <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '10px' }}>{err}</div>}
    </div>
  )
}
