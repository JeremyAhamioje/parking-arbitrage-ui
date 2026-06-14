'use client'

import Link from 'next/link'

export default function ChangeDetectionPage() {
  return (
    <div>
      <section className="dive" style={{ paddingTop: '60px', paddingBottom: '60px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: '42px', marginBottom: '16px' }}>Change Detection</h1>
          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-2)',
              maxWidth: '600px',
              marginBottom: '32px',
            }}
          >
            Real-time alerts for significant parking market changes. Get instant notifications
            when prices spike or inventory drops dramatically.
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
              Our change detection engine continuously monitors parking prices and availability
              across all tracked venues. When market conditions change significantly, we flag
              them as signals for your attention.
            </p>
            <ul
              style={{
                listStyle: 'none',
                color: 'var(--text-2)',
                lineHeight: '1.8',
              }}
            >
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text)' }}>Price Spikes</strong> — Prices increase
                more than 20% compared to previous snapshot
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text)' }}>Inventory Drops</strong> — Available
                spaces decrease by more than 40%
              </li>
              <li style={{ marginBottom: '12px' }}>
                <strong style={{ color: 'var(--text)' }}>High-Profile Signals</strong> — Alerts
                sorted by severity and impact
              </li>
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
              Example Alert
            </h3>
            <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: 600, color: 'var(--red)', fontSize: '14px' }}>
                  PRICE SPIKE
                </div>
                <div
                  style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px', color: 'var(--text)' }}
                >
                  Downtown Parking Lot A
                </div>
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Previous price:</strong> $18.50
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Current price:</strong> $23.75
                </div>
                <div>
                  <strong>Change:</strong> +28% (exceeds 20% threshold)
                </div>
              </div>
            </div>
          </div>
        </div>

        <section style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '24px', fontWeight: 600 }}>
            Why It Matters
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
                  color: 'var(--blue)',
                  marginBottom: '12px',
                  textTransform: 'uppercase',
                }}
              >
                Identify Opportunities
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Price spikes often signal increased demand. Respond quickly to market movements.
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
                Monitor Inventory
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Inventory drops indicate scarcity. Plan your strategy based on availability trends.
              </p>
            </div>
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
                Stay Ahead
              </div>
              <p style={{ color: 'var(--text-2)', lineHeight: '1.6' }}>
                Real-time alerts ensure you never miss a market shift. React faster than the
                competition.
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
            Ready to get alerts?
          </h2>
          <p style={{ marginBottom: '24px', opacity: 0.9 }}>
            View all change detection signals and start monitoring your markets.
          </p>
          <Link
            href="/alerts"
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
            View Alerts
          </Link>
        </div>
      </div>
    </div>
  )
}
