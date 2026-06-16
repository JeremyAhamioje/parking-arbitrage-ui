'use client'

import { useState, useMemo, useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import type { LiveRow, PlatformStatus } from '@/lib/engine'

const PLATFORM_ORDER = ['spothero', 'parkwhiz', 'way']
const platLabel = (p: string) => p.charAt(0).toUpperCase() + p.slice(1)

/** Live elapsed-ms ticker while `running` is true; freezes at the final value after. */
export function useElapsed(running: boolean) {
  const [ms, setMs] = useState(0)
  const start = useRef(0)
  useEffect(() => {
    if (!running) return
    start.current = Date.now()
    setMs(0)
    const id = setInterval(() => setMs(Date.now() - start.current), 100)
    return () => clearInterval(id)
  }, [running])
  return ms
}

export const fmtSecs = (ms: number) => `${(ms / 1000).toFixed(1)}s`

/** Toggle which platforms a fetch queries. Default all on; Way is the slow leg. */
export function PlatformSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (k: string) => onChange(value.includes(k) ? value.filter((x) => x !== k) : [...value, k])
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-2)' }}>Platforms</span>
      {PLATFORM_ORDER.map((k) => {
        const on = value.includes(k)
        return (
          <button
            key={k} type="button" onClick={() => toggle(k)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '7px 12px', borderRadius: '10px',
              border: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              background: on ? 'color-mix(in srgb, var(--blue) 12%, var(--surface))' : 'var(--surface)',
              color: on ? 'var(--text)' : 'var(--text-2)', opacity: on ? 1 : 0.6,
            }}
          >
            <span style={{
              width: '15px', height: '15px', borderRadius: '4px', display: 'grid', placeItems: 'center', fontSize: '10px',
              border: on ? 'none' : '1px solid var(--border)', background: on ? 'var(--blue)' : 'transparent', color: '#fff',
            }}>{on ? '✓' : ''}</span>
            {platLabel(k)}
            {k === 'way' && <span style={{ fontSize: '10px', color: 'var(--text-2)', opacity: 0.8 }}>(slow)</span>}
          </button>
        )
      })}
    </div>
  )
}
import { exportXlsx, copyRowsTsv } from '@/lib/engine'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ok:              { bg: 'color-mix(in srgb, var(--green) 18%, var(--surface))', color: '#137333', label: 'OK' },
  blocked:         { bg: 'color-mix(in srgb, var(--red) 18%, var(--surface))', color: '#c5221f', label: 'Blocked' },
  timeout:         { bg: 'color-mix(in srgb, var(--red) 18%, var(--surface))', color: '#c5221f', label: 'Timed out' },
  error:           { bg: 'color-mix(in srgb, var(--red) 18%, var(--surface))', color: '#c5221f', label: 'Error' },
  event_not_found: { bg: 'color-mix(in srgb, var(--yellow) 20%, var(--surface))', color: '#806600', label: 'Event not found' },
  no_events:       { bg: 'color-mix(in srgb, var(--yellow) 20%, var(--surface))', color: '#806600', label: 'No events' },
  no_destination:  { bg: 'color-mix(in srgb, var(--yellow) 20%, var(--surface))', color: '#806600', label: 'Venue not found' },
  no_listings:     { bg: 'var(--pill)', color: 'var(--text-2)', label: 'No listings' },
  no_results:      { bg: 'var(--pill)', color: 'var(--text-2)', label: 'No results' },
}

export function PlatformChips({
  platforms,
  onPickCandidate,
}: {
  platforms: PlatformStatus[]
  onPickCandidate?: (title: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '18px' }}>
      {platforms.map((p) => {
        const s = STATUS_STYLE[p.status] || { bg: 'var(--pill)', color: 'var(--text-2)', label: p.status }
        const conf = p.eventConfidence ?? p.venueConfidence
        return (
          <div
            key={p.platform}
            style={{
              border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px',
              background: 'var(--surface)', boxShadow: 'var(--shadow)', minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <strong style={{ fontSize: '13px', textTransform: 'capitalize', color: 'var(--text)' }}>{p.platform}</strong>
              <span style={{ fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '999px', background: s.bg, color: s.color }}>
                {s.label}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-2)', marginTop: '6px' }}>
              {p.count} listing{p.count === 1 ? '' : 's'}
              {conf != null && <> · <span title="match confidence">{conf}%</span></>}
              {p.needsConfirmation && <span style={{ color: '#806600' }}> · confirm?</span>}
            </div>
            {p.matchedEvent && (
              <div style={{ fontSize: '11px', color: 'var(--text-3, var(--text-2))', marginTop: '4px' }} title={p.matchedEvent}>
                → {p.matchedEvent.length > 38 ? p.matchedEvent.slice(0, 38) + '…' : p.matchedEvent}
              </div>
            )}
            {/* Low-confidence / not-found → offer the platform's real event titles */}
            {onPickCandidate && (p.needsConfirmation || p.status === 'event_not_found') && p.candidates?.length ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
                {p.candidates.slice(0, 4).map((c, i) => (
                  <button
                    key={i}
                    onClick={() => onPickCandidate(c.title)}
                    style={{
                      fontSize: '11px', padding: '3px 8px', borderRadius: '8px', cursor: 'pointer',
                      border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)',
                    }}
                    title={c.date ? `${c.title} (${c.date})` : c.title}
                  >
                    {c.title.length > 24 ? c.title.slice(0, 24) + '…' : c.title}
                  </button>
                ))}
              </div>
            ) : null}
            {p.error && !p.candidates?.length && (
              <div style={{ fontSize: '11px', color: '#c5221f', marginTop: '4px' }}>{p.error}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const COLUMNS: { key: keyof LiveRow; label: string; align?: 'right' }[] = [
  { key: 'platform', label: 'Platform' },
  { key: 'spot', label: 'Parking Spot' },
  { key: 'address', label: 'Distance to venue' },
  { key: 'price', label: 'Price', align: 'right' },
  { key: 'availability', label: 'Availability' },
  { key: 'event', label: 'Event' },
  { key: 'date', label: 'Date' },
  { key: 'confidence', label: 'Conf.', align: 'right' },
]

// Full XLSX/clipboard column order (the spec's 16 headers). Explicit so export
// order never depends on row key iteration.
const EXPORT_COLUMNS = [
  'platform', 'venue', 'event', 'spot', 'address', 'price', 'advertised', 'currency',
  'availability', 'availableSpaces', 'distanceMeters', 'distanceMiles', 'confidence',
  'date', 'amenities', 'timestamp',
]

export function ResultsTable({
  rows,
  filename,
  emptyText = 'No listings.',
}: {
  rows: LiveRow[]
  filename: string
  emptyText?: string
}) {
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [platform, setPlatform] = useState<string>('all')
  const [sortKey, setSortKey] = useState<'price' | 'distance'>('price')

  // Distinct platforms present (canonical order) with counts → filter buttons.
  const present = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of rows) counts[r.platform] = (counts[r.platform] || 0) + 1
    const known = PLATFORM_ORDER.filter((p) => counts[p]).map((p) => ({ p, n: counts[p] }))
    const extra = Object.keys(counts).filter((p) => !PLATFORM_ORDER.includes(p)).map((p) => ({ p, n: counts[p] }))
    return [...known, ...extra]
  }, [rows])

  const rank = (p: string) => { const i = PLATFORM_ORDER.indexOf(p); return i === -1 ? 99 : i }
  const sortVal = (r: LiveRow) => (sortKey === 'price' ? (r.price ?? Infinity) : (r.distanceMeters ?? Infinity))

  const visibleRows = useMemo(() => {
    const v = (platform === 'all' ? rows.slice() : rows.filter((r) => r.platform === platform))
    v.sort((a, b) => {
      if (platform === 'all') { const d = rank(a.platform) - rank(b.platform); if (d) return d }
      return sortVal(a) - sortVal(b)
    })
    return v
  }, [rows, platform, sortKey])

  const exportName = platform === 'all' ? filename : `${filename}_${platform}`

  const doCopy = async () => {
    await copyRowsTsv(visibleRows as any, EXPORT_COLUMNS)
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }
  const doExport = async () => {
    setBusy(true)
    try { await exportXlsx(visibleRows as any, exportName, EXPORT_COLUMNS) } finally { setBusy(false) }
  }

  return (
    <div>
      {/* Toolbar: platform isolation (left) + sort & actions (right) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '14px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-2)', fontWeight: 600 }}>Show</span>
          <FilterBtn active={platform === 'all'} onClick={() => setPlatform('all')} label="All" count={rows.length} />
          {present.map(({ p, n }) => (
            <FilterBtn key={p} active={platform === p} onClick={() => setPlatform(p)} label={platLabel(p)} count={n} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', border: '1px solid var(--border)', borderRadius: '9px', overflow: 'hidden' }}>
            <SortBtn active={sortKey === 'price'} onClick={() => setSortKey('price')}>Cheapest</SortBtn>
            <SortBtn active={sortKey === 'distance'} onClick={() => setSortKey('distance')}>Closest</SortBtn>
          </div>
          <button onClick={doCopy} disabled={!visibleRows.length} style={btn(!visibleRows.length)}>{copied ? 'Copied ✓' : 'Copy'}</button>
          <button onClick={doExport} disabled={!visibleRows.length || busy} style={btn(!visibleRows.length || busy, true)}>{busy ? 'Exporting…' : 'Export XLSX'}</button>
        </div>
      </div>

      <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px' }}>
        {visibleRows.length} listing{visibleRows.length === 1 ? '' : 's'}
        {platform !== 'all' ? ` · ${platLabel(platform)} only` : ''} · sorted by {sortKey === 'price' ? 'price' : 'distance'}
      </div>

      {visibleRows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)', border: '1px dashed var(--border)', borderRadius: '12px' }}>{emptyText}</div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg)' }}>
                {COLUMNS.map((c) => (
                  <th key={String(c.key)} style={{ textAlign: c.align || 'left', padding: '10px 12px', color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap', borderBottom: '1px solid var(--border)' }}>{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                  {COLUMNS.map((c) => (
                    <td key={String(c.key)} style={{ textAlign: c.align || 'left', padding: '10px 12px', color: 'var(--text)', whiteSpace: c.key === 'address' ? 'normal' : 'nowrap' }}>
                      {c.key === 'address' ? locationLine(r) : fmt(c.key, r[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, label, count }: { active: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '9px',
      fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: '1px solid var(--border)',
      background: active ? 'var(--blue)' : 'var(--surface)', color: active ? '#fff' : 'var(--text)',
    }}>
      {label}
      <span style={{ fontSize: '11px', fontWeight: 700, opacity: active ? 0.85 : 0.6 }}>{count}</span>
    </button>
  )
}

function SortBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{
      padding: '7px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: 'none',
      background: active ? 'var(--blue)' : 'var(--surface)', color: active ? '#fff' : 'var(--text-2)',
    }}>{children}</button>
  )
}

// "1101 S State St. - 0.9 miles/21 minutes to the venue" — address + walking
// distance + estimated walk time (~urban pace; ≈21 min per 0.9 mi).
function locationLine(r: LiveRow) {
  const base = r.address || r.spot || '—'
  const m = r.distanceMeters
  if (m == null) return base
  const miles = (m / 1609.34).toFixed(1)
  const mins = Math.round(m / 69)
  return `${base} - ${miles} miles/${mins} minutes to the venue`
}

function fmt(key: keyof LiveRow, v: any) {
  if (v == null || v === '') return '—'
  if (key === 'price') return `$${Number(v).toFixed(2)}`
  if (key === 'distanceMiles') return `${v} mi`
  if (key === 'confidence') return `${v}%`
  if (key === 'platform') return <span style={{ textTransform: 'capitalize' }}>{v}</span>
  return v
}

function btn(disabled: boolean, primary = false): CSSProperties {
  return {
    padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
    border: primary ? 'none' : '1px solid var(--border)',
    background: primary ? 'var(--blue)' : 'var(--surface)',
    color: primary ? '#fff' : 'var(--text)',
  }
}
