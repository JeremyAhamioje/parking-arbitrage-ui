'use client'

import { useEffect, useRef } from 'react'

// Shared palette so the carousel dots in hero.tsx light up in the same colors,
// in the same order, as the sweeping graph lines.
export const HERO_COLORS = ['#ea4335', '#4285f4', '#34a853', '#a142f4'] // red, blue, green, purple
const HERO_COLORS_DARK = ['#f28b82', '#8ab4f8', '#81c995', '#c58af9']

type Props = {
  active: number          // which color/line is currently sweeping in (0..count-1)
  paused: boolean         // freeze the sweep
  onAdvance?: () => void  // fired when a line finishes sweeping → parent moves to next color
}

// One spiky "search interest" path across the canvas. Seeded so each color gets a
// visibly different shape (different peak positions/heights), like real trend lines.
function buildLine(width: number, height: number, seed: number) {
  const baseY = height * 0.66
  const amp = height * 0.34
  // Per-seed peaks: { center x (fraction), width (fraction), height (fraction of amp) }
  const peakSets = [
    [[0.18, 0.05, 1.0], [0.46, 0.07, 0.55], [0.82, 0.045, 0.85]],
    [[0.28, 0.06, 0.7], [0.6, 0.04, 1.0], [0.9, 0.06, 0.5]],
    [[0.12, 0.04, 0.6], [0.4, 0.05, 0.9], [0.68, 0.06, 0.7], [0.95, 0.04, 1.0]],
    [[0.34, 0.05, 1.0], [0.72, 0.07, 0.6], [0.9, 0.035, 0.9]],
  ]
  const peaks = peakSets[seed % peakSets.length]
  const pts: { x: number; y: number }[] = []
  for (let x = 0; x <= width + 60; x += 5) {
    let y = baseY
    y -= Math.sin(x * 0.012 + seed * 1.7) * amp * 0.1 // gentle baseline ripple
    for (const [cx, cw, ch] of peaks) {
      const c = cx * width
      const w = cw * width
      y -= ch * amp * Math.exp(-((x - c) ** 2) / (2 * w * w)) // gaussian spike
    }
    pts.push({ x, y })
  }
  return pts
}

export default function TrendHeroGraph({ active, paused, onAdvance }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Latest props read inside the rAF loop without re-subscribing it.
  const activeRef = useRef(active)
  const pausedRef = useRef(paused)
  const advanceRef = useRef(onAdvance)
  useEffect(() => { activeRef.current = active }, [active])
  useEffect(() => { pausedRef.current = paused }, [paused])
  useEffect(() => { advanceRef.current = onAdvance }, [onAdvance])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let lines: { x: number; y: number }[][] = []

    const isDark = () => document.documentElement.classList.contains('dark')

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (!rect) return
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lines = HERO_COLORS.map((_, i) => buildLine(width, height, i))
    }
    resize()

    // Draw one line, optionally clipped to x <= cutoff, optionally colored + filled.
    const strokePath = (
      pts: { x: number; y: number }[],
      color: string,
      lineWidth: number,
      cutoff: number,
      fill: string | CanvasGradient | null
    ) => {
      if (pts.length < 2) return
      if (fill) {
        ctx.beginPath()
        ctx.moveTo(pts[0].x, height)
        for (const p of pts) { if (p.x > cutoff) break; ctx.lineTo(p.x, p.y) }
        ctx.lineTo(Math.min(cutoff, pts[pts.length - 1].x), height)
        ctx.closePath()
        ctx.fillStyle = fill
        ctx.fill()
      }
      ctx.beginPath()
      let started = false
      let last = pts[0]
      for (const p of pts) {
        if (p.x > cutoff) break
        if (!started) { ctx.moveTo(p.x, p.y); started = true } else { ctx.lineTo(p.x, p.y) }
        last = p
      }
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.stroke()
      return last
    }

    let reveal = 0            // 0..1 sweep progress of the active line
    let hold = 0             // ms held at full reveal before advancing
    let lastActive = activeRef.current
    let prev = performance.now()
    let raf = 0
    const SWEEP_MS = 3000
    const HOLD_MS = 550

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const dark = isDark()
      const palette = dark ? HERO_COLORS_DARK : HERO_COLORS
      const grey = dark ? 'rgba(232,234,237,0.10)' : 'rgba(60,64,67,0.10)'
      const a = ((activeRef.current % lines.length) + lines.length) % lines.length

      // Grey trails for every non-active line (the "already swept / faded" look).
      lines.forEach((pts, i) => { if (i !== a) strokePath(pts, grey, 2, width + 60, null) })

      // Active line: colored, revealed left→right, with a gradient fill + glowing head.
      const cutoff = reveal * (width + 60)
      const color = palette[a]
      const fill = ctx.createLinearGradient(0, height * 0.2, 0, height)
      fill.addColorStop(0, `${color}2e`)
      fill.addColorStop(1, `${color}00`)
      const head = strokePath(lines[a], color, 2.6, cutoff, fill)
      if (head && reveal < 1) {
        ctx.beginPath()
        ctx.arc(head.x, head.y, 4, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
        ctx.beginPath()
        ctx.arc(head.x, head.y, 8, 0, Math.PI * 2)
        ctx.fillStyle = `${color}33`
        ctx.fill()
      }
    }

    const frame = (now: number) => {
      const dt = now - prev
      prev = now
      // External color change (dot click / parent advance) restarts the sweep.
      if (activeRef.current !== lastActive) { lastActive = activeRef.current; reveal = 0; hold = 0 }
      if (!pausedRef.current) {
        if (reveal < 1) {
          reveal = Math.min(1, reveal + dt / SWEEP_MS)
        } else {
          hold += dt
          if (hold >= HOLD_MS) { hold = 0; reveal = 0; advanceRef.current?.() }
        }
      }
      draw()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    window.addEventListener('resize', resize)
    const themeObs = new MutationObserver(() => draw())
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      themeObs.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} className="wave-canvas" aria-hidden />
}
