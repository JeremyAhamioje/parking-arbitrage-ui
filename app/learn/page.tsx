'use client'

import { useRouter } from 'next/navigation'
import { ARTICLES } from '@/lib/articles'

export default function ArticlesIndex() {
  const router = useRouter()

  return (
    <div>
      <section className="dive" style={{ paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="wrap">
          <h1 style={{ fontSize: '42px', marginBottom: '14px', letterSpacing: '-1px' }}>Articles</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-2)', maxWidth: '620px' }}>
            Guides to every ParkingIntel tool — from live event fetching to sheet normalization and market monitoring.
          </p>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: '36px', paddingBottom: '90px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '22px',
          }}
        >
          {ARTICLES.map((a) => (
            <article
              key={a.slug}
              onClick={() => router.push(a.route)}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px',
                overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow)',
                transition: 'transform 0.25s, box-shadow 0.25s', display: 'flex', flexDirection: 'column',
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = 'translateY(-3px)'; el.style.boxShadow = 'var(--shadow-hover)' }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = 'none'; el.style.boxShadow = 'var(--shadow)' }}
            >
              <div style={{ position: 'relative', height: '180px', background: 'var(--bg-band)' }}>
                <img src={a.image} alt={a.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                {a.isNew && (
                  <span style={{
                    position: 'absolute', top: '12px', left: '12px', fontSize: '11px', fontWeight: 700,
                    padding: '4px 10px', borderRadius: '999px', background: 'var(--blue)', color: '#fff',
                  }}>NEW</span>
                )}
              </div>
              <div style={{ padding: '20px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <span style={{
                  display: 'inline-block', alignSelf: 'flex-start', fontSize: '12px', fontWeight: 600,
                  color: 'var(--text-2)', background: 'var(--pill)', padding: '4px 11px', borderRadius: '999px', marginBottom: '12px',
                }}>{a.tag}</span>
                <h3 style={{ fontSize: '21px', fontWeight: 600, letterSpacing: '-0.3px', marginBottom: '8px' }}>{a.title}</h3>
                <p style={{ fontSize: '14.5px', color: 'var(--text-2)', lineHeight: 1.5, flex: 1 }}>{a.desc}</p>
                <span style={{ marginTop: '16px', fontSize: '14px', fontWeight: 600, color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Read article
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
