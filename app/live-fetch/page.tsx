'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { PlatformChips, ResultsTable } from '@/components/engine-results'
import { liveEvent, type LiveResult } from '@/lib/engine'

export default function LiveFetchPage() {
  const [venue, setVenue] = useState('')
  const [event, setEvent] = useState('')
  const [date, setDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<LiveResult | null>(null)

  const run = async (eventOverride?: string) => {
    const ev = eventOverride ?? event
    if (!venue.trim() || !ev.trim()) { setError('Enter both a venue and an event.'); return }
    if (eventOverride) setEvent(eventOverride)
    setLoading(true); setError(null)
    try {
      const r = await liveEvent({ venue: venue.trim(), event: ev.trim(), date: date || undefined })
      setResult(r)
    } catch (e: any) {
      setError(e.message || 'Fetch failed'); setResult(null)
    } finally { setLoading(false) }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)', minHeight: '100vh' }}>
      <Header />
      <div className="wrap" style={{ paddingTop: '56px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>Live Event Fetch</h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '32px', fontSize: '16px', maxWidth: '680px' }}>
          Enter a venue and event. The engine searches SpotHero, Way, and ParkWhiz live and returns
          parking for <strong>that event only</strong> — not generic venue inventory. Typos and abbreviations are fine.
        </p>

        {/* Form */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow)', marginBottom: '28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '16px' }}>
            <Field label="Venue" placeholder="Madison Square Garden" value={venue} onChange={setVenue} onEnter={() => run()} />
            <Field label="Event" placeholder="Taylor Swift" value={event} onChange={setEvent} onEnter={() => run()} />
            <Field label="Date (optional)" type="date" value={date} onChange={setDate} onEnter={() => run()} />
          </div>
          <button onClick={() => run()} disabled={loading}
            style={{ padding: '11px 26px', borderRadius: '11px', border: 'none', background: 'var(--blue)', color: '#fff', fontWeight: 600, fontSize: '14px', cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Fetching…' : 'Fetch'}
          </button>
          {error && <p style={{ color: '#c5221f', fontSize: '13px', marginTop: '12px' }}>{error}</p>}
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 22px', border: '1px solid var(--border)', borderRadius: '12px', background: 'var(--surface)', marginBottom: '24px' }}>
            <Spinner />
            <span style={{ fontSize: '14px', color: 'var(--text-2)' }}>
              Searching live across SpotHero, Way &amp; ParkWhiz — Way clears Cloudflare so this can take up to a minute.
            </span>
          </div>
        )}

        {result && !loading && (
          <>
            <PlatformChips platforms={result.platforms} onPickCandidate={(title) => run(title)} />
            {result.summary.needsConfirmation && (
              <div style={{ background: 'color-mix(in srgb, var(--yellow) 14%, var(--surface))', border: '1px solid color-mix(in srgb, var(--yellow) 40%, var(--border))', borderRadius: '12px', padding: '12px 16px', marginBottom: '18px', fontSize: '13px', color: '#806600' }}>
                Some matches are below 80% confidence. Pick the correct event from a platform&apos;s suggestions above to refine.
              </div>
            )}
            <ResultsTable rows={result.rows} filename={`live_${venue}_${event}`.replace(/\s+/g, '-')} emptyText="No event-specific parking found on any platform." />
          </>
        )}
      </div>
    </main>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', onEnter }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; onEnter?: () => void
}) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '6px' }}>{label}</span>
      <input
        type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && onEnter) onEnter() }}
        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px' }}
      />
    </label>
  )
}

function Spinner() {
  return (
    <span style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </span>
  )
}
