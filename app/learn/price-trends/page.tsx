'use client'

import Link from 'next/link'

export default function PriceTrendsPage() {
  return (
    <div>
      <section className="dive" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: '42px', marginBottom: '16px' }}>Price Trends</h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-2)',
              maxWidth: '600px',
              marginBottom: '32px',
            }}
          >
            Interactive visualization of parking prices over time. Understand venue classification
            and identify market patterns with our comprehensive trend analysis.
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
              Venue Classifications
            </h2>
            <p style={{ color: 'var(--text-2)', marginBottom: '24px', lineHeight: '1.6' }}>
              Each venue is classified based on its activity level and price movement patterns.
              This helps you quickly identify which venues are worth monitoring.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#34a853',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                    High Activity Positive
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                    High demand with stable or increasing prices
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#ea4335',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                    High Activity Negative
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                    High demand but prices are dropping
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#fbbc04',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>Volatile</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                    Unpredictable pricing patterns with frequent swings
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#9aa0a6',
                    flexShrink: 0,
                    marginTop: '4px',
                  }}
                />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text)' }}>Flat / Low Activity</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                    Low demand with stable pricing
                  </div>
                </div>
              </div>
            </div>
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
              Interactive Features
            </h3>
            <ul
              style={{
                listStyle: 'none',
                color: 'var(--text-2)',
                fontSize: '14px',
                lineHeight: '1.8',
              }}
            >
              <li style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text)' }}>Hover for Details</strong> — See exact
                prices and times
              </li>
              <li style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text)' }}>Filter by Venue</strong> — Focus on
                specific locations
              </li>
              <li style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text)' }}>Time Range Selection</strong> — Analyze
                any period
              </li>
              <li>
                <strong style={{ color: 'var(--text)' }}>Export Data</strong> — Download trends
                for analysis
              </li>
            </ul>
          </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 600 }}>
            Use Cases
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}
          >
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Strategic Planning
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Use historical trends to forecast future demand and adjust your pricing strategy
                accordingly.
              </p>
            </div>
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Competitive Analysis
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Compare how your venues perform against similar facilities in the market.
              </p>
            </div>
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Risk Assessment
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Identify volatile venues that require closer monitoring and risk management.
              </p>
            </div>
            <div style={{ background: 'var(--bg-band)', borderRadius: '12px', padding: '24px' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '12px',
                  color: 'var(--text)',
                }}
              >
                Growth Opportunities
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Spot emerging high-activity positive venues as expansion opportunities.
              </p>
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
            Explore Price Trends
          </h2>
          <p style={{ marginBottom: '24px', opacity: 0.9 }}>
            Interact with real-time price data and venue classifications.
          </p>
          <Link
            href="/spothero-data"
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
            View Trends
          </Link>
        </div>
      </div>
    </div>
  )
}
