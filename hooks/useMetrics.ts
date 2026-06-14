'use client'

import { useEffect, useState } from 'react'
import { fetchMetrics } from '@/lib/api'

export interface Metrics {
  avgPrice: string
  venuesTracked: number
  availableSpots: number
  bestDeal: { price: string; venue: string }
}

export function useMetrics() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadMetrics() {
      try {
        setLoading(true)
        const data = await fetchMetrics()
        if (data) {
          setMetrics(data)
        } else {
          setError('Failed to load metrics')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadMetrics()
  }, [])

  return { metrics, loading, error }
}
