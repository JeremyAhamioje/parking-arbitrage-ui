'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './theme-toggle'

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
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
