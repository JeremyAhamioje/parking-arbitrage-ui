'use client'

import { useState, type CSSProperties } from 'react'
import { Header } from '@/components/header'
import { PlatformChips, ResultsTable, PlatformSelect, useElapsed, fmtSecs } from '@/components/engine-results'
import { liveDate, type LiveResult } from '@/lib/engine'

// add hours to a 'YYYY-MM-DDTHH:mm' datetime-local string
function addHours(dtLocal: string, hours: number) {
  if (!dtLocal) return ''
  const d = new Date(dtLocal)
  if (isNaN(d.getTime())) return ''
  d.setHours(d.getHours() + hours)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function DateFetchPage() {
  const [venue, setVenue] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['spothero', 'parkwhiz', 'way'])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LiveResult | null>(null)
  const [tookMs, setTookMs] = useState<number | null>(null)
  const elapsed = useElapsed(loading)

  const onStartChange = (v: string) => {
    setStart(v)
    if (v && (!end || end <= v)) setEnd(addHours(v, 4)) // default a 4h window
  }

  const run = async () => {
    if (!venue.trim() || !start || !end) { setError('Enter a venue, a start time, and an end time.'); return }
    if (start >= end) { setError('End time must be after the start time.'); return }
    if (!platforms.length) { setError('Select at least one platform.'); return }
    setLoading(true); setError(null); setTookMs(null)
    const t0 = Date.now()
    try {
      setResult(await liveDate({ venue: venue.trim(), start, end, platforms }))
    } catch (e: any) {
      setError(e.message || 'Fetch failed'); setResult(null)
    } finally { setLoading(false); setTookMs(Date.now() - t0) }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Header />
      <div className="wrap" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>Manual Date &amp; Time Inventory Fetch</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '32px', fontSize: '16px', maxWidth: '700px' }}>
          No event needed. Pick a venue and an exact <strong>time period</strong> — the engine applies that window
          in each platform&apos;s own search and returns the generic, time-coded parking inventory across SpotHero,
          Way, and ParkWhiz.
        </p>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <label style={{ display: 'block' }}>
              <span style={lbl}>Venue</span>
              <input value={venue} placeholder="Madison Square Garden" onChange={(e) => setVenue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && run()} style={inp} />
            </label>
            <DateTimeField label="Start" value={start} onChange={onStartChange} />
            <DateTimeField label="End" value={end} onChange={setEnd} minDate={start ? start.slice(0, 10) : undefined} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <PlatformSelect value={platforms} onChange={setPlatforms} />
          </div>
          <button onClick={run} disabled={loading}
            style={{ padding: '11px 26px', borderRadius: '11px', border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
          {error && <p style={{ color: '#c5221f', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)', marginBottom: '24px' }}>
            <span style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </span>
            <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
              Fetching {platforms.map((p) => p[0].toUpperCase() + p.slice(1)).join(', ')} for {start?.replace('T', ' ')} → {end?.replace('T', ' ')} … <strong style={{ color: 'var(--text)' }}>{fmtSecs(elapsed)}</strong>
            </span>
          </div>
        )}

        {result && !loading && (
          <>
            {tookMs != null && (
              <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '12px' }}>
                Fetched in <strong style={{ color: 'var(--text)' }}>{fmtSecs(tookMs)}</strong>
              </div>
            )}
            <PlatformChips platforms={result.platforms} />
            <ResultsTable rows={result.rows} filename={`inventory_${venue}_${start}`.replace(/\s+/g, '-')} emptyText="No inventory found for that time period." />
          </>
        )}
      </div>
    </main>
  )
}

const lbl: CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }
const inp: CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }

// --- 12-hour (AM/PM) date-time picker ------------------------------------
// Native datetime-local renders 24h on many locales, which users find confusing.
// This control is explicit: a date + hour (1-12) + minutes + AM/PM, and emits the
// 24-hour 'YYYY-MM-DDTHH:mm' string the engine expects.
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
const MINUTES = ['00', '15', '30', '45']

function to24(hour12: number, mer: 'AM' | 'PM') {
  const h = hour12 % 12
  return mer === 'PM' ? h + 12 : h
}

function parseValue(value: string): { date: string; hour: number; min: string; mer: 'AM' | 'PM' } {
  if (!value || !value.includes('T')) return { date: value || '', hour: 6, min: '00', mer: 'PM' }
  const [d, t] = value.split('T')
  const h24 = parseInt(t.slice(0, 2), 10) || 0
  const min = MINUTES.includes(t.slice(3, 5)) ? t.slice(3, 5) : '00'
  let h12 = h24 % 12
  if (h12 === 0) h12 = 12
  return { date: d, hour: h12, min, mer: h24 >= 12 ? 'PM' : 'AM' }
}

function DateTimeField({ label, value, onChange, minDate }: {
  label: string; value: string; onChange: (v: string) => void; minDate?: string
}) {
  const p = parseValue(value)
  const emit = (date: string, hour: number, min: string, mer: 'AM' | 'PM') => {
    if (!date) { onChange(''); return }
    onChange(`${date}T${String(to24(hour, mer)).padStart(2, '0')}:${min}`)
  }
  const sel: CSSProperties = { ...inp, width: 'auto', flex: '0 0 auto', padding: '10px 8px' }
  return (
    <div>
      <span style={lbl}>{label}</span>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <input type="date" value={p.date} min={minDate}
          onChange={(e) => emit(e.target.value, p.hour, p.min, p.mer)} style={{ ...inp, flex: '1 1 150px', width: 'auto' }} />
        <select value={p.hour} aria-label={`${label} hour`}
          onChange={(e) => emit(p.date, +e.target.value, p.min, p.mer)} style={sel}>
          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <select value={p.min} aria-label={`${label} minutes`}
          onChange={(e) => emit(p.date, p.hour, e.target.value, p.mer)} style={sel}>
          {MINUTES.map((m) => <option key={m} value={m}>:{m}</option>)}
        </select>
        <select value={p.mer} aria-label={`${label} AM or PM`}
          onChange={(e) => emit(p.date, p.hour, p.min, e.target.value as 'AM' | 'PM')} style={sel}>
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}
