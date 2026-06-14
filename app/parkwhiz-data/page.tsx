'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { MetricsGrid } from '@/components/metrics-grid'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Venue {
  id: string
  name: string
  classification?: string
  avgPrice?: number
  minPrice?: number
  maxPrice?: number
  snapshotCount?: number
}

interface ParkWhizLot {
  id: string
  facility_name: string
  address: string
  amenities: string
  walking_meters: number | null
  total_price: number
}

// API returns snake_case classifications — map to readable labels + theme tokens.
const CLASSIFICATION: Record<string, { label: string; bg: string; color: string }> = {
  high_activity_positive: { label: 'Trending Up', bg: 'color-mix(in srgb, var(--green) 16%, var(--surface))', color: '#137333' },
  high_activity_negative: { label: 'Trending Down', bg: 'color-mix(in srgb, var(--red) 16%, var(--surface))', color: '#c5221f' },
  volatile: { label: 'Volatile', bg: 'color-mix(in srgb, var(--yellow) 16%, var(--surface))', color: '#806600' },
  low_activity_flat: { label: 'Flat', bg: 'var(--pill)', color: 'var(--text-2)' },
  insufficient_data: { label: 'Gathering Data', bg: 'var(--pill)', color: 'var(--text-2)' },
}

export default function ParkWhizDataPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [lots, setLots] = useState<ParkWhizLot[]>([])
  const [lotsLoading, setLotsLoading] = useState(false)

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${API}/api/snapshots?source=parkwhiz`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
      } catch (error) {
        console.error('Failed to fetch ParkWhiz venues:', error)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }
    fetchVenues()
  }, [])

  const handleVenueClick = async (venue: Venue) => {
    setSelectedVenue(venue)
    setLotsLoading(true)
    try {
      const res = await fetch(`${API}/api/venue/${venue.id}?source=parkwhiz`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      // recentSnapshots are ordered newest-first; keep the latest row per facility.
      const seen = new Set<string>()
      const latest: ParkWhizLot[] = []
      for (const snap of data.recentSnapshots || []) {
        const key = String(snap.facility_id)
        if (seen.has(key)) continue
        seen.add(key)
        latest.push({
          id: snap.id,
          facility_name: snap.facility_name,
          address: snap.address,
          amenities: snap.amenities,
          walking_meters: snap.walking_meters,
          total_price: snap.total_price,
        })
      }
      setLots(latest)
    } catch (error) {
      console.error('Failed to fetch ParkWhiz lots:', error)
      setLots([])
    } finally {
      setLotsLoading(false)
    }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />

      <div className="wrap" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>
          ParkWhiz Data
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '48px', fontSize: '16px' }}>
          Real-time parking intelligence from ParkWhiz
        </p>

        {/* Metrics Grid — ParkWhiz only */}
        <section style={{ marginBottom: '40px' }}>
          <MetricsGrid source="parkwhiz" />
        </section>

        {/* Source notice — ParkWhiz data has no event context */}
        <section style={{ marginBottom: '60px' }}>
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              boxShadow: 'var(--shadow)',
            }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                background: 'color-mix(in srgb, var(--blue) 14%, var(--surface))',
                color: 'var(--blue)',
                fontWeight: 700,
              }}
            >
              i
            </span>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-2)', lineHeight: 1.5 }}>
              ParkWhiz listings are pulled per venue for a standard evening window — no event-specific
              context yet. Spaces counts are not exposed by ParkWhiz, so lots show walking distance and
              amenities instead.
            </p>
          </div>
        </section>

        {/* Venues Grid */}
        <section>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px', letterSpacing: '-0.5px' }}>
            Tracked Venues
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              Loading venues...
            </div>
          ) : venues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              No ParkWhiz venues found yet. Run <code>npm run scrape:parkwhiz</code> to populate data.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              {venues.map((venue) => {
                const cls = venue.classification ? CLASSIFICATION[venue.classification] : null
                return (
                  <div
                    key={venue.id}
                    onClick={() => handleVenueClick(venue)}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      padding: '20px',
                      boxShadow: 'var(--shadow)',
                      transition: 'box-shadow 0.25s, transform 0.25s',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = 'var(--shadow-hover)'
                      el.style.transform = 'translateY(-3px)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.boxShadow = 'var(--shadow)'
                      el.style.transform = 'none'
                    }}
                  >
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: 'var(--text)' }}>
                      {venue.name}
                    </h3>
                    <div style={{ fontSize: '14px', color: 'var(--text-2)', lineHeight: '1.6' }}>
                      {typeof venue.avgPrice === 'number' && (
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Avg price:</strong> ${venue.avgPrice.toFixed(2)}
                        </div>
                      )}
                      {cls && (
                        <div>
                          <strong>Status:</strong>{' '}
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              background: cls.bg,
                              color: cls.color,
                            }}
                          >
                            {cls.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>

      {/* Lots Modal — ParkWhiz listings for the selected venue (no events) */}
      {selectedVenue && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={() => setSelectedVenue(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '650px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                  {selectedVenue.name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', margin: 0 }}>
                  ParkWhiz parking
                </p>
              </div>
              <button
                onClick={() => setSelectedVenue(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'var(--text-2)',
                }}
              >
                ✕
              </button>
            </div>

            {lotsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                Loading parking lots...
              </div>
            ) : lots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                No ParkWhiz listings found for this venue.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                      {lot.facility_name}
                    </h4>
                    {lot.address && (
                      <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px' }}>
                        {lot.address}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', fontSize: '13px', fontWeight: 500, flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--blue)' }}>
                        {typeof lot.total_price === 'number' ? `$${lot.total_price.toFixed(2)}` : '—'}
                      </span>
                      {typeof lot.walking_meters === 'number' && lot.walking_meters > 0 && (
                        <span style={{ color: 'var(--text-2)' }}>
                          {(lot.walking_meters / 1609.34).toFixed(1)} mi walk
                        </span>
                      )}
                      {lot.amenities && (
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '12px',
                            background: 'var(--pill)',
                            color: 'var(--text-2)',
                          }}
                        >
                          {lot.amenities}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
