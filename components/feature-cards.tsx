'use client'

import { useEffect, useRef, useState } from 'react'

const FEATURES = [
  {
    title: 'Real-Time Data',
    desc: 'Live parking availability and pricing across all major platforms.',
    icon: 'chart',
  },
  {
    title: 'Sentiment Analysis',
    desc: 'Understand market trends through comprehensive event discovery.',
    icon: 'pins',
  },
  {
    title: 'Insights',
    desc: 'Automated alerts for price changes and inventory fluctuations.',
    icon: 'alert',
  },
]

function FeatureIcon({ kind }: { kind: string }) {
  switch (kind) {
    case 'chart':
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#e8f0fe" />
          <path d="M20 90 Q40 60 60 75 T100 50 V120 H20Z" fill="#4285F4" fillOpacity=".18" />
          <path d="M20 90 Q40 60 60 75 T100 50" stroke="#4285F4" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )
    case 'pins':
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#fce8e6" />
          <circle cx="40" cy="50" r="8" fill="#EA4335" />
          <path d="M40 50 v15" stroke="#EA4335" strokeWidth="2.5" />
          <circle cx="70" cy="60" r="6" fill="#EA4335" fillOpacity=".7" />
          <circle cx="90" cy="40" r="6" fill="#EA4335" fillOpacity=".7" />
        </svg>
      )
    case 'alert':
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#fef7e0" />
          <path d="M60 20 l25 45 H35 Z" fill="#FBBC04" />
          <rect x="58" y="40" width="4" height="15" rx="2" fill="#fff" />
          <circle cx="60" cy="62" r="2.5" fill="#fff" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="120" height="120" fill="#eceef3" />
        </svg>
      )
  }
}

export default function FeatureCards() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cards = containerRef.current?.querySelectorAll('.feat-card')
    if (!cards) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const card = entry.target as HTMLElement
            const index = Array.from(cards).indexOf(card)
            setTimeout(() => {
              card.classList.add('in')
            }, index * 120)
            observer.unobserve(card)
          }
        })
      },
      { threshold: 0.2 }
    )

    cards.forEach((card) => observer.observe(card))

    return () => {
      cards.forEach((card) => observer.unobserve(card))
    }
  }, [])

  return (
    <section className="features">
      <div className="wrap">
        <div className="feat-head">
          <h3>
            What can <b>ParkingIntel</b> do for you?
          </h3>
        </div>

        <div className="feat-grid" ref={containerRef}>
          {FEATURES.map((feature) => (
            <div key={feature.title} className="feat-card">
              <div className="feat-thumb">
                <FeatureIcon kind={feature.icon} />
              </div>
              <div className="feat-body">
                <div className="txt">
                  <h4>{feature.title}</h4>
                  <p>{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
