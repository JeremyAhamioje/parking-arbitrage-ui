'use client'

import { useEffect, useState } from 'react'
import TrendHeroGraph from './trend-hero-graph'

// The three messages that used to live in "What can ParkingIntel do for you?",
// now driving the hero carousel. The heading stays constant; these rotate.
const SLIDES = [
  { title: 'Real-Time Data', desc: 'Live parking availability and pricing across all major platforms.' },
  { title: 'Sentiment Analysis', desc: 'Understand market trends through comprehensive event discovery.' },
  { title: 'Insights', desc: 'Automated alerts for price changes and inventory fluctuations.' },
]

export default function Hero() {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), 3600)
    return () => clearInterval(id)
  }, [paused])

  const scrollToTools = () => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <header className="hero">
      <TrendHeroGraph />

      <div className="wrap hero-inner">
        <div className="hero-head">
          <h1>
            Real-Time <span className="hl">Monitoring</span> System
          </h1>
        </div>

        <div className="hero-carousel" role="group" aria-roledescription="carousel">
          <div className="hslides">
            {SLIDES.map((s, i) => (
              <div key={s.title} className={`hslide ${i === active ? 'show' : ''}`} aria-hidden={i !== active}>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="hero-carousel-foot">
            <div className="hero-dots" role="tablist" aria-label="Highlights">
              {SLIDES.map((s, i) => (
                <button
                  key={s.title}
                  className={`hero-dot ${i === active ? 'active' : ''}`}
                  aria-label={s.title}
                  aria-selected={i === active}
                  role="tab"
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
            <button className="explore-btn" onClick={scrollToTools}>Explore</button>
          </div>
        </div>
      </div>

      <div className="wrap hero-caption-wrap">
        <div className="hero-caption">
          <span className="cap">Search interest, past 24 hours</span>
          <div className="dots">
            <span className="d c1" />
            <span className="d bar" />
            <span className="d c2" />
            <span className="d c3" />
            <span className="d c4" />
          </div>
          <button className="pausebtn" aria-label={paused ? 'Play' : 'Pause'} onClick={() => setPaused((p) => !p)}>
            {paused ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
