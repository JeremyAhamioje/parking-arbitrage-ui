'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { MetricsGrid } from '@/components/metrics-grid'
import { PriceTrendsTable } from '@/components/price-trends-table'
import { EventPriceTrendsTable } from '@/components/event-price-trends-table'

interface Venue {
  id: string
  name: string
  lat: number
  lon: number
  classification?: string
  lastPrice?: number
  availableSpaces?: number
}

interface VenueEvent {
  id: string
  event_name: string
  event_date: string
  starts_at?: string
  ends_at?: string
  source_url?: string
}

interface ParkingListing {
  id: string
  facility_name: string
  address: string
  total_price: number
  available_spaces: number
}

// /api/snapshots returns snake_case classifications — map to readable labels +
// theme tokens. (The old inline checks compared title-case strings that never
// matched the API output, so status badges silently never rendered.)
const CLASSIFICATION: Record<string, { label: string; bg: string; color: string }> = {
  high_activity_positive: { label: 'High Activity Positive', bg: 'color-mix(in srgb, var(--green) 16%, var(--surface))', color: '#137333' },
  high_activity_negative: { label: 'High Activity Negative', bg: 'color-mix(in srgb, var(--red) 16%, var(--surface))', color: '#c5221f' },
  volatile: { label: 'Volatile', bg: 'color-mix(in srgb, var(--yellow) 16%, var(--surface))', color: '#806600' },
  low_activity_flat: { label: 'Low Activity / Flat', bg: 'var(--pill)', color: 'var(--text-2)' },
  insufficient_data: { label: 'Gathering Data', bg: 'var(--pill)', color: 'var(--text-2)' },
}

export default function SpotHeroDataPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [venueEvents, setVenueEvents] = useState<VenueEvent[]>([])
  const [eventsLoading, setEventsLoading] = useState(false)
  const [genericListings, setGenericListings] = useState<ParkingListing[]>([])
  const [selectedEvent, setSelectedEvent] = useState<VenueEvent | null>(null)
  const [eventListings, setEventListings] = useState<ParkingListing[]>([])
  const [listingsLoading, setListingsLoading] = useState(false)
  const [trendView, setTrendView] = useState<'lot' | 'event'>('lot')

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/snapshots`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
      } catch (error) {
        console.error('Failed to fetch venues:', error)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    fetchVenues()
  }, [])

  const handleVenueClick = async (venue: Venue) => {
    setSelectedVenue(venue)
    setSelectedEvent(null)
    setEventsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      // Fetch events and snapshots for this venue
      const res = await fetch(`${apiUrl}/api/venue/${venue.id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()

      // Map events
      const events = (data.events || []).map((evt: any) => ({
        id: evt.id,
        event_name: evt.event_name,
        event_date: evt.event_date,
        starts_at: evt.starts_at,
        ends_at: evt.ends_at,
        source_url: evt.source_url,
      }))
      setVenueEvents(events)

      // If no events, prepare generic parking listings
      if (events.length === 0) {
        const generic = (data.recentSnapshots || [])
          .filter((snap: any) => !snap.event_id) // Only generic (no event_id)
          .map((snap: any) => ({
            id: snap.id,
            facility_name: snap.facility_name,
            address: snap.address,
            total_price: snap.total_price,
            available_spaces: snap.available_spaces,
          }))
        setGenericListings(generic)
      }
    } catch (error) {
      console.error('Failed to fetch:', error)
      setVenueEvents([])
      setGenericListings([])
    } finally {
      setEventsLoading(false)
    }
  }

  const handleEventClick = async (event: VenueEvent) => {
    setSelectedEvent(event)
    setListingsLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      // Fetch parking listings for this specific event
      const res = await fetch(`${apiUrl}/api/event/${event.id}`)
      if (!res.ok) throw new Error('Failed to fetch listings')
      const data = await res.json()
      // Map snapshots to parking listings
      const listings = (data.listings || []).map((snap: any) => ({
        id: snap.id,
        facility_name: snap.facilityName,
        address: snap.address,
        total_price: snap.totalPrice,
        available_spaces: snap.availableSpaces,
      }))
      setEventListings(listings)
    } catch (error) {
      console.error('Failed to fetch listings:', error)
      setEventListings([])
    } finally {
      setListingsLoading(false)
    }
  }

  return (
    <main style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      <Header />

      <div className="wrap" style={{ paddingTop: '60px', paddingBottom: '80px' }}>
        <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-1.5px' }}>
          SpotHero Data
        </h1>
        <p style={{ color: 'var(--text-2)', marginBottom: '48px', fontSize: '16px' }}>
          Real-time parking intelligence from SpotHero
        </p>

        {/* Metrics Grid */}
        <section style={{ marginBottom: '60px' }}>
          <MetricsGrid />
        </section>

        {/* Venues Grid */}
        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '24px', letterSpacing: '-0.5px' }}>
            Tracked Venues
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              Loading venues...
            </div>
          ) : venues.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              No venues found. Run the scraper to populate data.
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '18px',
              }}
            >
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  onClick={() => handleVenueClick(venue)}
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: 'var(--shadow)',
                    transition: 'box-shadow 0.25s, transform 0.25s, cursor 0.2s',
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
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      marginBottom: '12px',
                      color: 'var(--text)',
                    }}
                  >
                    {venue.name}
                  </h3>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--text-2)',
                      lineHeight: '1.6',
                    }}
                  >
                    {venue.lastPrice && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Latest price:</strong> ${venue.lastPrice.toFixed(2)}
                      </div>
                    )}
                    {venue.availableSpaces !== undefined && (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Available spaces:</strong> {venue.availableSpaces}
                      </div>
                    )}
                    {venue.classification && CLASSIFICATION[venue.classification] && (
                      <div>
                        <strong>Status:</strong>{' '}
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            background: CLASSIFICATION[venue.classification].bg,
                            color: CLASSIFICATION[venue.classification].color,
                          }}
                        >
                          {CLASSIFICATION[venue.classification].label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Price Trends — two lenses on the same scrape data */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.5px', margin: 0 }}>
              Price Trends
            </h2>

            {/* Segmented control: switch lens between by-lot and by-event */}
            <div
              role="tablist"
              aria-label="Price trends view"
              style={{
                display: 'inline-flex',
                padding: '4px',
                borderRadius: '12px',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                gap: '4px',
              }}
            >
              {([
                { key: 'lot', label: 'By Lot', hint: 'Per-venue spread & per-lot volatility' },
                { key: 'event', label: 'By Event', hint: 'Per-event premium, volatility & ROI' },
              ] as const).map(tab => {
                const active = trendView === tab.key
                return (
                  <button
                    key={tab.key}
                    role="tab"
                    aria-selected={active}
                    title={tab.hint}
                    onClick={() => setTrendView(tab.key)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '9px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
                      background: active ? 'var(--surface)' : 'transparent',
                      color: active ? 'var(--text)' : 'var(--text-2)',
                      boxShadow: active ? 'var(--shadow)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          <p style={{ color: 'var(--text-2)', marginBottom: '24px', fontSize: '15px' }}>
            {trendView === 'lot'
              ? 'Per-venue price spread and per-lot volatility. Expand a venue to see every parking lot, its latest price, change since last scrape, and price range.'
              : 'Volatility and ROI for specific events at each venue — e.g. how much pricier parking gets for a Raiders game vs a normal day. Expand an event for the exact, scrape-derived reasons that feed the sentiment model.'}
          </p>

          {trendView === 'lot' ? <PriceTrendsTable /> : <EventPriceTrendsTable />}
        </section>
      </div>

      {/* Events Modal */}
      {selectedVenue && !selectedEvent && (
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
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)' }}>
                Events at {selectedVenue.name}
              </h2>
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

            {eventsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                Loading...
              </div>
            ) : venueEvents.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {venueEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'background 0.2s, transform 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'var(--bg-band)'
                      el.style.transform = 'translateY(-2px)'
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement
                      el.style.background = 'var(--bg)'
                      el.style.transform = 'none'
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                      {event.event_name}
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                      {event.event_date ? new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}
                    </div>
                  </div>
                ))}
              </div>
            ) : genericListings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '8px' }}>
                  No upcoming events. Showing generic parking available:
                </div>
                {genericListings.map((listing) => (
                  <div
                    key={listing.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                      {listing.facility_name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px' }}>
                      {listing.address}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 500 }}>
                      <span style={{ color: 'var(--blue)' }}>${listing.total_price.toFixed(2)}</span>
                      <span style={{ color: 'var(--green)' }}>{listing.available_spaces} spaces</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                No events or parking data found for this venue.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Parking Modal */}
      {selectedEvent && (
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
          onClick={() => setSelectedEvent(null)}
        >
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '650px',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                  Parking for {selectedEvent.event_name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>at {selectedVenue?.name}</p>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
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

            {listingsLoading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                Loading parking listings...
              </div>
            ) : eventListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
                No parking listings found for this event.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {eventListings.map((listing) => (
                  <div
                    key={listing.id}
                    style={{
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      padding: '14px',
                    }}
                  >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                      {listing.facility_name}
                    </h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '6px' }}>
                      {listing.address}
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', fontWeight: 500 }}>
                      <span style={{ color: 'var(--blue)' }}>${listing.total_price.toFixed(2)}</span>
                      <span style={{ color: 'var(--green)' }}>{listing.available_spaces} spaces</span>
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
