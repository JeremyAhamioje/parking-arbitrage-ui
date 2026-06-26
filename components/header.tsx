'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

// Navbar bell + live unread-count badge. Polls the API and also refetches when
// the alerts page fires an `alerts:refresh` event (e.g. after "mark all read"),
// so the badge updates without waiting for the next poll.
function AlertBell() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alerts/unread-count`)
        const d = await res.json()
        if (alive) setCount(d?.count || 0)
      } catch { /* ignore */ }
    }
    load()
    const id = setInterval(load, 60000)
    const onRefresh = () => load()
    window.addEventListener('alerts:refresh', onRefresh)
    return () => { alive = false; clearInterval(id); window.removeEventListener('alerts:refresh', onRefresh) }
  }, [])

  return (
    <Link href="/alerts" className="alert-bell" aria-label={count ? `Alerts, ${count} unread` : 'Alerts'}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {count > 0 && <span className="alert-bell-badge">{count > 99 ? '99+' : count}</span>}
    </Link>
  )
}

export function Header() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const htmlElement = document.documentElement
    const currentTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light'
    setTheme(currentTheme)

    const observer = new MutationObserver(() => {
      const newTheme = htmlElement.classList.contains('dark') ? 'dark' : 'light'
      setTheme(newTheme)
    })

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const logoUrl =
    theme === 'dark'
      ? 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780820574/Gemini_Generated_Image_yzv2wmyzv2wmyzv2-removebg-preview_xbw7vl.png'
      : 'https://res.cloudinary.com/dz6kxumoo/image/upload/v1780820573/Gemini_Generated_Image_7uwvjy7uwvjy7uwv-removebg-preview_holi10.png'

  return (
    <nav>
      <div className="wrap nav-inner">
        <Link href="/" className="logo">
          <img src={logoUrl} alt="ParkingIntel" style={{ height: '56px', width: 'auto' }} />
        </Link>

        <div className="nav-links">
          <Link href="/" className="active">
            Dashboard
          </Link>
          <Link href="/#tools">Explore Tools</Link>
        </div>

        <div className="nav-right">
          <AlertBell />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
