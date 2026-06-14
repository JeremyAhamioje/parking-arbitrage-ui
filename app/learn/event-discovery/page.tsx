'use client'

import Link from 'next/link'

export default function EventDiscoveryPage() {
  return (
    <div>
      <section className="dive" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: '42px', marginBottom: '16px' }}>Event Discovery</h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-2)',
              maxWidth: '600px',
              marginBottom: '32px',
            }}
          >
            Correlate events with parking demand to identify market opportunities. Automatically
            detect new events and their impact on parking availability.
          </p>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '40px',
            marginBottom: '60px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 600 }}>
              How It Works
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px', lineHeight: '1.6' }}>
              Our event discovery system integrates with Ticketmaster to automatically detect new
              events and on-sale dates. When events are announced near your tracked venues, we flag
              them for your analysis.
            </p>
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                marginBottom: '12px',
                marginTop: '24px',
                color: 'var(--text)',
              }}
            >
              Event Types Tracked
            </h3>
            <ul
              style={{
                listStyle: 'none',
                color: 'var(--text-2)',
                lineHeight: '1.8',
              }}
            >
              <li style={{ marginBottom: '8px' }}>🎵 Concerts and Music Festivals</li>
              <li style={{ marginBottom: '8px' }}>🏀 Sports Events</li>
              <li style={{ marginBottom: '8px' }}>🎭 Theater and Performing Arts</li>
              <li style={{ marginBottom: '8px' }}>🎪 Entertainment Events</li>
              <li>📍 And More</li>
            </ul>
          </div>

          <div
            style={{
              background: 'var(--bg-band)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border)',
            }}
          >
            <h3 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: 600 }}>
              Data Points
            </h3>
            <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, marginBottom: '4px' }}>
                  Event Name
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)' }}>
                  Concert: The Weeknd @ Crypto.com Arena
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, marginBottom: '4px' }}>
                  Date
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)' }}>2026-08-15</div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, marginBottom: '4px' }}>
                  Venue
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)' }}>Crypto.com Arena, LA</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: 600, marginBottom: '4px' }}>
                  On-Sale Date
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text)' }}>2026-07-20</div>
              </div>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 600 }}>
            Why Events Matter for Parking
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px',
            }}
          >
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--red)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Demand Spike
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Major events drive parking demand, creating pricing opportunities.
              </p>
            </div>
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--blue)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Predictability
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Known events allow you to forecast demand and adjust strategy proactively.
              </p>
            </div>
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--green)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Competition
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Understand competing venues and their event calendars in your market.
              </p>
            </div>
          </div>
        </section>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 600 }}>
            Discovery Workflow
          </h2>
          <div
            style={{
              background: 'var(--bg-band)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    margin: '0 auto 12px',
                  }}
                >
                  1
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Ticketmaster Query
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                  Search for events near tracked venues
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    margin: '0 auto 12px',
                  }}
                >
                  2
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Event Detection
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                  Identify new or upcoming events
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    margin: '0 auto 12px',
                  }}
                >
                  3
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Parking Impact
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                  Analyze expected demand impact
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'var(--blue)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 600,
                    margin: '0 auto 12px',
                  }}
                >
                  4
                </div>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--text)',
                    marginBottom: '4px',
                  }}
                >
                  Alert
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                  Get notified of opportunities
                </div>
              </div>
            </div>
          </div>
        </section>

        <div
          style={{
            background: 'var(--blue)',
            color: '#fff',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: '28px', marginBottom: '16px', fontWeight: 600 }}>
            Discover Events
          </h2>
          <p style={{ marginBottom: '24px', opacity: 0.9 }}>
            View all detected events and their impact on parking markets.
          </p>
          <Link
            href="/events"
            style={{
              display: 'inline-block',
              background: 'var(--surface)',
              color: 'var(--blue)',
              padding: '12px 32px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '15px',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = 'none'
            }}
          >
            View Events
          </Link>
        </div>
      </div>
    </div>
  )
}
