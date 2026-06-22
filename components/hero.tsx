'use client'

import { useEffect, useState } from 'react'
import TrendHeroGraph, { HERO_COLORS } from './trend-hero-graph'

// The three messages that used to live in "What can ParkingIntel do for you?",
// now driving the hero text carousel. The heading stays constant; these rotate.
// `img` is a placeholder for now — drop a real asset path in to swap it.
const SLIDES = [
  {
    title: 'Real-Time Data',
    desc: 'Live parking availability and pricing across all major platforms.',
    icon: '📊',
    img: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781432142/Gemini_Generated_Image_szst0gszst0gszst_w4ofxd.png',
  },
  {
    title: 'Sentiment Analysis',
    desc: 'Understand market trends through comprehensive event discovery.',
    icon: '🧭',
    img: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780821869/Gemini_Generated_Image_2t14ip2t14ip2t14_b7hrrj.png',
  },
  {
    title: 'Insights',
    desc: 'Automated alerts for price changes and inventory fluctuations.',
    icon: '💡',
    img: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1782156352/copy_of_download_19_ayug5p.jpg',
  },
]

export default function Hero() {
  const [slide, setSlide] = useState(0)        // text carousel (3 slides)
  const [graphColor, setGraphColor] = useState(0) // animated graph color (4 lines)
  const [paused, setPaused] = useState(false)

  // Auto-rotate the text slides (independent of the graph sweep).
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setSlide((i) => (i + 1) % SLIDES.length), 3600)
    return () => clearInterval(id)
  }, [paused])

  const scrollToTools = () => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })
  const advanceGraph = () => setGraphColor((i) => (i + 1) % HERO_COLORS.length)

  return (
    <header className="hero">
      <TrendHeroGraph active={graphColor} paused={paused} onAdvance={advanceGraph} />

      <div className="wrap hero-inner">
        <div className="hero-head">
          <h1>
            Real-Time <span className="hl">Monitoring</span> System
          </h1>
        </div>

        <div className="hero-carousel" role="group" aria-roledescription="carousel">
          {/* Bordered card — the active slide's image + text swap inside it */}
          <div className="hslides">
            {SLIDES.map((s, i) => (
              <div key={s.title} className={`hslide ${i === slide ? 'show' : ''}`} aria-hidden={i !== slide}>
                <div className="hslide-img" data-i={i}>
                  {s.img ? <img src={s.img} alt="" /> : <span aria-hidden>{s.icon}</span>}
                </div>
                <div className="hslide-text">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="hero-carousel-foot">
            {/* Graph control — series dots + master play/pause (freezes slides + sweep) */}
            <div className="hero-graphctl">
              <div className="gdots" role="tablist" aria-label="Graph series">
                {HERO_COLORS.map((c, i) => (
                  <button
                    key={c}
                    className={`gdot ${i === graphColor ? 'active' : ''}`}
                    style={{ ['--gc' as string]: c }}
                    aria-label={`Series ${i + 1}`}
                    aria-selected={i === graphColor}
                    role="tab"
                    onClick={() => setGraphColor(i)}
                  />
                ))}
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
            <button className="explore-btn" onClick={scrollToTools}>Explore</button>
          </div>
        </div>

      </div>
    </header>
  )
}
