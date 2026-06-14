'use client'

import { useEffect, useRef } from 'react'

export default function TrendHeroGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return

    canvas.width = rect.width
    canvas.height = rect.height

    const isDark = document.documentElement.classList.contains('dark')
    const lineColor = isDark ? 'rgba(138, 180, 248, 0.4)' : 'rgba(66, 133, 244, 0.3)'
    const fillColor = isDark ? 'rgba(138, 180, 248, 0.15)' : 'rgba(66, 133, 244, 0.1)'

    let animationProgress = 0
    const animationDuration = 2000 // 2 seconds

    const generateWavePoints = (offset: number) => {
      const points = []
      const width = canvas.width
      const height = canvas.height
      const baseY = height * 0.6

      for (let x = 0; x <= width; x += 10) {
        const sine = Math.sin((x / width) * Math.PI * 3 + offset) * 30
        const y = baseY + sine
        points.push({ x, y })
      }

      return points
    }

    const draw = (progress: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const offset = (progress / animationDuration) * Math.PI * 2

      // Generate wave points
      const points = generateWavePoints(offset)

      // Draw filled area under wave
      ctx.fillStyle = fillColor
      ctx.beginPath()
      ctx.moveTo(0, canvas.height)

      points.forEach((point) => {
        ctx.lineTo(point.x, point.y)
      })

      ctx.lineTo(canvas.width, canvas.height)
      ctx.fill()

      // Draw line on top
      ctx.strokeStyle = lineColor
      ctx.lineWidth = 2.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.beginPath()

      points.forEach((point, index) => {
        if (index === 0) {
          ctx.moveTo(point.x, point.y)
        } else {
          ctx.lineTo(point.x, point.y)
        }
      })

      ctx.stroke()
    }

    let animationStartTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - animationStartTime
      const progress = elapsed % animationDuration

      draw(progress)
      requestAnimationFrame(animate)
    }

    animate()

    // Handle theme changes via MutationObserver
    const observer = new MutationObserver(() => {
      animationStartTime = Date.now() // Reset animation on theme change
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="wave-canvas"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
      }}
    />
  )
}
