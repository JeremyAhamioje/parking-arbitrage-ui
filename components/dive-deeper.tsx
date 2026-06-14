'use client'

import { useRouter } from 'next/navigation'
import type { CSSProperties } from 'react'
import { NEW_ARTICLES } from '@/lib/articles'

const imgStyle: CSSProperties = { width: '100%', height: '100%', objectFit: 'cover', display: 'block' }

export default function DiveDeeper() {
  const router = useRouter()
  const [big, ...small] = NEW_ARTICLES

  return (
    <section className="dive">
      <div className="wrap">
        <svg className="penta" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
          <circle cx="24" cy="24" r="12" fill="currentColor" opacity="0.2" />
          <circle cx="24" cy="24" r="4" fill="currentColor" />
        </svg>

        <h2>Dive deeper</h2>
        <p className="sub">Learn how each action tool works — fetch live event parking, pull date inventory, and normalize messy sheets.</p>

        <div className="dive-grid">
          <div className="big-card" onClick={() => router.push(big.route)}>
            <div className="big-graphic" style={{ padding: 0, minHeight: '300px' }}>
              <img src={big.image} alt={big.title} style={imgStyle} />
            </div>
            <div className="big-body">
              <span className="tag">{big.tag}</span>
              <h3>{big.title}</h3>
              <p>{big.desc}</p>
            </div>
          </div>

          <div className="small-stack">
            {small.map((card) => (
              <div key={card.slug} className="small-card" onClick={() => router.push(card.route)}>
                <div className="small-thumb">
                  <img src={card.image} alt={card.title} style={imgStyle} />
                </div>
                <div className="small-body">
                  <h4>{card.title}</h4>
                  <p>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '36px', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => router.push('/learn')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 28px', borderRadius: '999px', cursor: 'pointer',
              border: '1px solid var(--border)', background: 'var(--surface)',
              color: 'var(--text)', fontWeight: 600, fontSize: '15px',
              fontFamily: 'var(--font-display)', boxShadow: 'var(--shadow)',
              transition: 'transform 0.15s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = 'var(--shadow-hover)' }}
            onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'none'; el.style.boxShadow = 'var(--shadow)' }}
          >
            Read all articles
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
