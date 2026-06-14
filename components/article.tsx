'use client'

import Link from 'next/link'

export interface Step { title: string; body: string }

export function ArticleShell({
  tag, title, intro, image, steps, tips, ctaLabel, ctaHref,
}: {
  tag: string
  title: string
  intro: string
  image: string
  steps: Step[]
  tips?: string[]
  ctaLabel: string
  ctaHref: string
}) {
  return (
    <div>
      <section className="dive" style={{ paddingTop: '60px', paddingBottom: '40px', textAlign: 'left' }}>
        <div
          className="wrap"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '44px', alignItems: 'center' }}
        >
          <div>
            <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: 600, color: 'var(--text-2)', background: 'var(--pill)', padding: '5px 12px', borderRadius: '999px', marginBottom: '18px' }}>{tag}</span>
            <h1 style={{ fontSize: '44px', fontWeight: 700, letterSpacing: '-1.2px', lineHeight: 1.05, marginBottom: '18px' }}>{title}</h1>
            <p style={{ fontSize: '18px', color: 'var(--text-2)', lineHeight: 1.55, marginBottom: '28px', maxWidth: '520px' }}>{intro}</p>
            <Link
              href={ctaHref}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'var(--blue)', color: '#fff', padding: '12px 28px', borderRadius: '999px', fontWeight: 600, fontSize: '15px' }}
            >
              {ctaLabel}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: 'var(--shadow)', aspectRatio: '16 / 11', background: 'var(--bg-band)' }}>
            <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
        </div>
      </section>

      <div className="wrap" style={{ paddingTop: '40px', paddingBottom: '90px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 600, marginBottom: '28px', letterSpacing: '-0.4px' }}>How to use it</h2>
        <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '18px', counterReset: 'step' }}>
          {steps.map((s, i) => (
            <li key={i} style={{ display: 'flex', gap: '18px', background: 'var(--bg-band)', border: '1px solid var(--border)', borderRadius: '14px', padding: '20px 22px' }}>
              <div style={{ flex: '0 0 36px', width: '36px', height: '36px', borderRadius: '50%', background: 'var(--blue)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '15px' }}>{i + 1}</div>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 600, marginBottom: '5px' }}>{s.title}</h3>
                <p style={{ fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.55 }}>{s.body}</p>
              </div>
            </li>
          ))}
        </ol>

        {tips && tips.length > 0 && (
          <section style={{ marginTop: '48px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 600, marginBottom: '18px' }}>Good to know</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tips.map((t, i) => (
                <li key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '15px', color: 'var(--text-2)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--blue)', fontWeight: 700, lineHeight: 1.4 }}>•</span>
                  {t}
                </li>
              ))}
            </ul>
          </section>
        )}

        <div style={{ marginTop: '56px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <Link href={ctaHref} style={{ background: 'var(--blue)', color: '#fff', padding: '12px 28px', borderRadius: '999px', fontWeight: 600, fontSize: '15px' }}>{ctaLabel}</Link>
          <Link href="/learn" style={{ background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '12px 28px', borderRadius: '999px', fontWeight: 600, fontSize: '15px' }}>All articles</Link>
        </div>
      </div>
    </div>
  )
}
