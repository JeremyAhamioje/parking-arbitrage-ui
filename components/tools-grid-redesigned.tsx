'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ToolCardModal from './tool-card-modal'

type Tool = {
  id: string
  name: string
  desc: string
  image: string
  status: 'live' | 'soon'
  route: string
  buttonText: string
}

const TOOLS: Tool[] = [
  {
    id: 'live-event',
    name: 'Live Event Fetch',
    desc: 'Enter a venue and event. The engine searches SpotHero, Way, and ParkWhiz live and returns parking for that event only — with typo-tolerant matching and confidence scores.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781432142/Gemini_Generated_Image_szst0gszst0gszst_w4ofxd.png',
    status: 'live' as const,
    route: '/live-fetch',
    buttonText: 'Open Tool',
  },
  {
    id: 'date-inventory',
    name: 'Manual Date & Time Fetch',
    desc: 'No event needed. Pick a venue and an exact time period — the engine writes that window into each platform and returns time-coded generic inventory across all three.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781432141/Gemini_Generated_Image_mjlgrkmjlgrkmjlg_la2jh9.png',
    status: 'live' as const,
    route: '/date-fetch',
    buttonText: 'Open Tool',
  },
  {
    id: 'normalizer',
    name: 'Sheet Normalizer',
    desc: 'Upload a messy XLSX or CSV. Auto-detects your columns, fetches live parking per row, and matches it back with Gemini — appending enriched columns without overwriting your data.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1781430979/Gemini_Generated_Image_29yf4p29yf4p29yf_idogxw.png',
    status: 'live' as const,
    route: '/normalize',
    buttonText: 'Open Tool',
  },
  {
    id: 'spothero',
    name: 'SpotHero Collector',
    desc: 'Real-time parking metrics and price trends across all monitored SpotHero venues. Track availability, pricing, and identify market opportunities.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780820574/SpotHero_wyavfj.png',
    status: 'live' as const,
    route: '/spothero-data',
    buttonText: 'View Data',
  },
  {
    id: 'event',
    name: 'Event Discovery',
    desc: 'Automatically detect new events and their impact on parking availability. Surface every listing for a trending event in one place.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780821868/_116313598_ticketmaster_vj2524.jpg',
    status: 'live' as const,
    route: '/learn/event-discovery',
    buttonText: 'Learn More',
  },
  {
    id: 'trends',
    name: 'Price Trends',
    desc: 'Interactive visualization of parking prices over time with venue classification. See which venues are high-activity positive, negative, volatile, or flat.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780821869/Gemini_Generated_Image_2t14ip2t14ip2t14_b7hrrj.png',
    status: 'live' as const,
    route: '/learn/price-trends',
    buttonText: 'Explore',
  },
  {
    id: 'signals',
    name: 'Change Detection',
    desc: 'Real-time alerts for significant market changes. Get notified of 20%+ price spikes and 40%+ inventory drops instantly.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780822375/download_19_ayug5p.jpg',
    status: 'live' as const,
    route: '/learn/change-detection',
    buttonText: 'View Alerts',
  },
  {
    id: 'way',
    name: 'Way Scraper',
    desc: 'Direct collection from Way.com parking inventory. Hourly pricing and lot-level coverage across every monitored venue.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780820573/images_uxe6vu.jpg',
    status: 'live' as const,
    route: '/way-data',
    buttonText: 'View Data',
  },
  {
    id: 'parkwhiz',
    name: 'ParkWhiz Scraper',
    desc: 'Direct collection from ParkWhiz inventory. Per-venue lot pricing, walking distance, and amenities across every monitored venue.',
    image: 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780820573/fb-og-new_hmjwxq.png',
    status: 'live' as const,
    route: '/parkwhiz-data',
    buttonText: 'View Data',
  },
]

export default function ToolsGridRedesigned() {
  const router = useRouter()
  const [openModal, setOpenModal] = useState<string | null>(null)

  const handleToolClick = (tool: typeof TOOLS[0]) => {
    if (tool.status === 'live') {
      setOpenModal(tool.id)
    }
  }

  const handleModalAction = (tool: typeof TOOLS[0]) => {
    if (tool.route && tool.route !== '#') {
      setOpenModal(null)
      router.push(tool.route)
    }
  }

  return (
    <>
      <section className="tools" id="tools">
        <div className="wrap">
          <h2>Tools</h2>
          <p className="sub">A full toolkit for tracking and acting on the parking market in real time.</p>

          <div className="tools-grid">
            {TOOLS.map((tool) => (
              <div
                key={tool.id}
                className={`tool-card ${tool.status === 'live' ? 'live' : 'soon'}`}
                onClick={() => handleToolClick(tool)}
              >
                <div className="tool-thumb">
                  <img src={tool.image} alt={tool.name} />
                  <span className={`badge ${tool.status === 'live' ? 'live' : 'soon'}`}>
                    {tool.status === 'live' ? 'Live' : 'Coming Soon'}
                  </span>
                  {tool.status === 'soon' && (
                    <div className="dev-overlay">In Development</div>
                  )}
                </div>
                <div className="tool-body">
                  <h4>{tool.name}</h4>
                  <p>{tool.desc}</p>
                  {tool.status === 'live' ? (
                    <span className="tool-route">
                      Open modal
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M5 12h14M13 6l6 6-6 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="tool-route muted">Available soon</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {TOOLS.map((tool) => (
        <ToolCardModal
          key={tool.id}
          isOpen={openModal === tool.id}
          onClose={() => setOpenModal(null)}
          toolName={tool.name}
          toolImage={tool.image}
          toolDesc={tool.desc}
          buttonText={tool.buttonText}
          buttonRoute={tool.route}
          buttonAction={
            tool.status === 'live'
              ? () => handleModalAction(tool)
              : undefined
          }
          isComingSoon={tool.status === 'soon'}
        />
      ))}
    </>
  )
}
