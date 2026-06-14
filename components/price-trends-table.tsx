'use client'

import { useEffect, useMemo, useState } from 'react'

interface Facility {
  facilityId: string
  facilityName: string
  address: string
  walkingMeters: number | null
  latestPrice: number | null
  prevPrice: number | null
  priceDelta: number
  priceDeltaPct: number
  latestSpaces: number | null
  prevSpaces: number | null
  spacesDelta: number | null
  minPrice: number | null
  maxPrice: number | null
  avgPrice: number | null
  volatility: number
  trend: 'up' | 'down' | 'flat' | string
  priceHistory: number[]
  scrapeCount: number
  lastScrapedAt: string
  genericAvgPrice: number | null
  genericCount: number
  eventAvgPrice: number | null
  eventCount: number
  eventPremiumPct: number | null
}

interface VenueRow {
  id: string
  name: string
  facilityCount: number
  minPrice: number | null
  maxPrice: number | null
  avgPrice: number | null
  spread: number | null
  avgVolatility: number
  maxEventPremiumPct: number | null
  cheapestFacility: string | null
  facilities: Facility[]
}

interface LogEntry {
  runId: string | null
  scrapedAt: string
  price: number | null
  spaces: number | null
  prevPrice: number | null
  priceDelta: number | null
  priceDeltaPct: number | null
  prevSpaces: number | null
  spacesDelta: number | null
  isEventContext: boolean
}

type SortKey = 'name' | 'avgPrice' | 'spread' | 'avgVolatility' | 'facilityCount' | 'eventPremium'

function money(n: number | null | undefined) {
  if (n === null || n === undefined) return '—'
  return `$${n.toFixed(2)}`
}

// Color buckets for volatility — the core LLM/arbitrage signal.
// Higher swing = more arbitrage opportunity (and risk).
function volColor(v: number) {
  if (v >= 0.4) return 'var(--red)'
  if (v >= 0.15) return 'var(--yellow)'
  if (v > 0) return 'var(--green)'
  return 'var(--text-3)'
}

function volLabel(v: number) {
  if (v >= 0.4) return 'High'
  if (v >= 0.15) return 'Medium'
  if (v > 0) return 'Low'
  return 'Flat'
}

// Tiny inline sparkline from the rolling price window
function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length < 2) return <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>—</span>
  const w = 84
  const h = 24
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w
      const y = h - ((v - min) / range) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
  const rising = data[data.length - 1] >= data[0]
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline
        points={pts}
        fill="none"
        stroke={rising ? 'var(--green)' : 'var(--red)'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}

function DeltaCell({ delta, pct }: { delta: number; pct: number }) {
  const color = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text-3)'
  const arrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '–'
  if (delta === 0) return <span style={{ color }}>–</span>
  return (
    <span style={{ color, fontWeight: 600, whiteSpace: 'nowrap' }}>
      {arrow} {money(Math.abs(delta))} <span style={{ fontSize: '11px', opacity: 0.85 }}>({pct > 0 ? '+' : ''}{pct.toFixed(1)}%)</span>
    </span>
  )
}

export function PriceTrendsTable() {
  const [venues, setVenues] = useState<VenueRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('avgVolatility')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    const run = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${apiUrl}/api/facility-stats`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
      } catch (e) {
        console.error('facility-stats fetch failed:', e)
        setError('Could not load price data.')
        setVenues([])
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

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
          v.facilities.some(f => f.facilityName?.toLowerCase().includes(q))
      )
    }
    const dir = sortDir === 'asc' ? 1 : -1
    return [...r].sort((a, b) => {
      let av: number | string
      let bv: number | string
      switch (sortKey) {
        case 'name': av = a.name; bv = b.name; break
        case 'avgPrice': av = a.avgPrice ?? 0; bv = b.avgPrice ?? 0; break
        case 'spread': av = a.spread ?? 0; bv = b.spread ?? 0; break
        case 'facilityCount': av = a.facilityCount; bv = b.facilityCount; break
        case 'eventPremium': av = a.maxEventPremiumPct ?? -Infinity; bv = b.maxEventPremiumPct ?? -Infinity; break
        default: av = a.avgVolatility; bv = b.avgVolatility
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
        Loading price table…
      </div>
    )
  }

  if (error || venues.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-2)', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px' }}>
        {error || 'No price data yet. Run the scraper or backfill-facility-stats.js to populate the table.'}
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
          placeholder="Search venue or lot…"
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
          {rows.length} venue{rows.length === 1 ? '' : 's'} · sorted by{' '}
          <strong style={{ color: 'var(--text)' }}>{sortKey === 'avgVolatility' ? 'volatility' : sortKey}</strong>
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
                <th style={th} onClick={() => setSort('facilityCount')}>Lots{arrowFor('facilityCount')}</th>
                <th style={th} onClick={() => setSort('avgPrice')}>Avg Price{arrowFor('avgPrice')}</th>
                <th style={th}>Cheapest</th>
                <th style={th}>Priciest</th>
                <th style={th} onClick={() => setSort('spread')}>Spread{arrowFor('spread')}</th>
                <th style={th} onClick={() => setSort('avgVolatility')}>Volatility{arrowFor('avgVolatility')}</th>
                <th style={th} onClick={() => setSort('eventPremium')}>Event Premium{arrowFor('eventPremium')}</th>
                <th style={th}>Scrapes</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(v => {
                const isOpen = expanded.has(v.id)
                return (
                  <FragmentRow
                    key={v.id}
                    venue={v}
                    isOpen={isOpen}
                    onToggle={() => toggle(v.id)}
                    td={td}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-2)' }}>
        <span><strong style={{ color: 'var(--text)' }}>Spread</strong> = price gap between a venue&apos;s cheapest and priciest lot (arbitrage headroom)</span>
        <span><strong style={{ color: 'var(--text)' }}>Event Premium</strong> = how much pricier the venue&apos;s lots get on event days vs normal (the buy signal). “—” = no event-day data yet</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)' }} /> High volatility ≥ 40%</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--yellow)' }} /> Medium 15–40%</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)' }} /> Low &lt; 15%</span>
      </div>
    </div>
  )
}

function FragmentRow({
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
  // Per-facility scrape_count varies; the venue's max ≈ how many runs it's appeared in.
  const maxScrapes = venue.facilities.reduce((m, f) => Math.max(m, f.scrapeCount || 0), 0)
  return (
    <>
      <tr
        onClick={onToggle}
        style={{ cursor: 'pointer', background: isOpen ? 'var(--bg-band-2)' : 'transparent' }}
      >
        <td style={{ ...td, textAlign: 'center', color: 'var(--text-2)' }}>{isOpen ? '▾' : '▸'}</td>
        <td style={{ ...td, fontWeight: 600 }}>{venue.name}</td>
        <td style={td}>{venue.facilityCount}</td>
        <td style={td}>{money(venue.avgPrice)}</td>
        <td style={{ ...td, color: 'var(--green)', fontWeight: 600 }}>{money(venue.minPrice)}</td>
        <td style={{ ...td, color: 'var(--red)', fontWeight: 600 }}>{money(venue.maxPrice)}</td>
        <td style={{ ...td, fontWeight: 600 }}>{money(venue.spread)}</td>
        <td style={td}>
          <span
            style={{
              display: 'inline-block',
              padding: '3px 10px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 600,
              color: '#fff',
              background: volColor(venue.avgVolatility),
            }}
          >
            {volLabel(venue.avgVolatility)} · {(venue.avgVolatility * 100).toFixed(0)}%
          </span>
        </td>
        <td style={td}>
          {venue.maxEventPremiumPct === null ? (
            <span style={{ color: 'var(--text-3)', fontSize: '13px' }}>—</span>
          ) : (
            <span style={{ color: venue.maxEventPremiumPct > 0 ? 'var(--green)' : 'var(--text-2)', fontWeight: 700, fontSize: '14px' }}>
              {venue.maxEventPremiumPct > 0 ? '+' : ''}{venue.maxEventPremiumPct.toFixed(0)}%
            </span>
          )}
        </td>
        <td style={{ ...td, color: 'var(--text-2)' }}>
          {maxScrapes}
          <span style={{ fontSize: '11px', color: 'var(--text-3)', display: 'block' }}>runs</span>
        </td>
      </tr>

      {isOpen && (
        <tr>
          <td colSpan={10} style={{ padding: 0, background: 'var(--bg-band-2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 16px 20px 50px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
                <thead>
                  <tr>
                    {['', 'Parking Lot', 'Latest', 'Change', 'Spaces', 'Range', 'Trend', 'Vol', 'Scrapes'].map((h, i) => (
                      <th key={i} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {venue.facilities.map(f => (
                    <FacilityRow key={f.facilityId} venueId={venue.id} facility={f} />
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

function fmtTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

// One parking lot. Click to fetch + reveal its run-by-run price log (the delta history).
function FacilityRow({ venueId, facility: f }: { venueId: string; facility: Facility }) {
  const [open, setOpen] = useState(false)
  const [log, setLog] = useState<LogEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && log === null) {
      setLoading(true)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const res = await fetch(`${apiUrl}/api/facility-price-log/${venueId}/${encodeURIComponent(f.facilityId)}`)
        if (!res.ok) throw new Error('failed')
        const data = await res.json()
        setLog(data.log || [])
      } catch {
        setLog([])
      } finally {
        setLoading(false)
      }
    }
  }

  const cell: React.CSSProperties = { padding: '12px', fontSize: '13px' }

  return (
    <>
      <tr style={{ borderTop: '1px solid var(--border)', cursor: 'pointer' }} onClick={toggle}>
        <td style={{ ...cell, textAlign: 'center', color: 'var(--text-2)', width: '28px' }}>{open ? '▾' : '▸'}</td>
        <td style={cell}>
          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{f.facilityName}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>{f.address}</div>
        </td>
        <td style={{ ...cell, fontSize: '14px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>{money(f.latestPrice)}</td>
        <td style={cell}><DeltaCell delta={f.priceDelta} pct={f.priceDeltaPct} /></td>
        <td style={{ ...cell, color: 'var(--text-2)' }}>
          {f.latestSpaces ?? '—'}
          {f.spacesDelta !== null && f.spacesDelta !== 0 && (
            <span style={{ color: f.spacesDelta > 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6, fontSize: '11px' }}>
              ({f.spacesDelta > 0 ? '+' : ''}{f.spacesDelta})
            </span>
          )}
        </td>
        <td style={{ ...cell, fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{money(f.minPrice)}–{money(f.maxPrice)}</td>
        <td style={cell}><Sparkline data={f.priceHistory} /></td>
        <td style={cell}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: volColor(f.volatility) }}>{(f.volatility * 100).toFixed(0)}%</span>
        </td>
        <td style={{ ...cell, color: 'var(--text-2)' }}>{f.scrapeCount}</td>
      </tr>

      {open && (
        <tr>
          <td colSpan={9} style={{ padding: 0, background: 'var(--surface-2)', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '12px 16px 18px 48px' }}>
              {loading ? (
                <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '12px' }}>Loading run history…</div>
              ) : !log || log.length === 0 ? (
                <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '12px' }}>
                  No run history recorded yet. (Run backfill-price-log.js to reconstruct from past scrapes.)
                </div>
              ) : (
                <>
                  {f.eventPremiumPct !== null && (
                    <div style={{ display: 'flex', gap: '18px', alignItems: 'center', marginBottom: '12px', padding: '10px 14px', borderRadius: '10px', background: 'color-mix(in srgb, var(--blue) 8%, var(--surface))', border: '1px solid var(--border)', flexWrap: 'wrap' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Baseline (generic)</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{money(f.genericAvgPrice)} <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 400 }}>· {f.genericCount} scrapes</span></div>
                      </div>
                      <div style={{ fontSize: '18px', color: 'var(--text-3)' }}>→</div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Event avg</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)' }}>{money(f.eventAvgPrice)} <span style={{ fontSize: '11px', color: 'var(--text-3)', fontWeight: 400 }}>· {f.eventCount} scrapes</span></div>
                      </div>
                      <div style={{ marginLeft: 'auto' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>Event premium</div>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: f.eventPremiumPct > 0 ? 'var(--green)' : 'var(--red)' }}>
                          {f.eventPremiumPct > 0 ? '+' : ''}{f.eventPremiumPct.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.4px', fontWeight: 600 }}>
                    Run-by-run history · {log.length} scrape{log.length === 1 ? '' : 's'} (newest first)
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '560px' }}>
                    <thead>
                      <tr>
                        {['When', 'Price', 'Change', 'Spaces', 'Context'].map(h => (
                          <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {log.map((e, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{fmtTime(e.scrapedAt)}</td>
                          <td style={{ padding: '8px 12px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{money(e.price)}</td>
                          <td style={{ padding: '8px 12px', fontSize: '12px' }}>
                            {e.priceDelta === null ? (
                              <span style={{ color: 'var(--text-3)' }}>baseline</span>
                            ) : (
                              <DeltaCell delta={e.priceDelta} pct={e.priceDeltaPct ?? 0} />
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '12px', color: 'var(--text-2)' }}>
                            {e.spaces ?? '—'}
                            {e.spacesDelta !== null && e.spacesDelta !== 0 && (
                              <span style={{ color: e.spacesDelta > 0 ? 'var(--green)' : 'var(--red)', marginLeft: 6 }}>
                                ({e.spacesDelta > 0 ? '+' : ''}{e.spacesDelta})
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '8px 12px', fontSize: '11px' }}>
                            <span style={{ padding: '2px 8px', borderRadius: '10px', background: e.isEventContext ? 'color-mix(in srgb, var(--blue) 16%, var(--surface))' : 'var(--pill)', color: e.isEventContext ? 'var(--blue)' : 'var(--text-3)', fontWeight: 600 }}>
                              {e.isEventContext ? 'event' : 'generic'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
