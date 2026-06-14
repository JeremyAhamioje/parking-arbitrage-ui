'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
}

export function MetricsGrid({ source }: { source?: string }) {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        const qs = source ? `?source=${encodeURIComponent(source)}` : ''
        const res = await fetch(`${apiUrl}/api/metrics${qs}`)
        const data = await res.json()

        setMetrics([
          {
            label: 'Avg Price',
            value: data.avgPrice,
            change: 'across all venues',
            trend: 'neutral',
          },
          {
            label: 'Venues Tracked',
            value: data.venuesTracked,
            change: 'with data',
            trend: 'neutral',
          },
          {
            label: 'Available Spots',
            value: data.availableSpots.toLocaleString(),
            change: 'total parking',
            trend: 'neutral',
          },
          {
            label: 'Best Deal',
            value: data.bestDeal.price,
            change: data.bestDeal.venue,
            trend: 'neutral',
          },
        ])
      } catch (error) {
        console.error('Failed to fetch metrics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [source])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {metric.label}
          </p>
          <p className="text-3xl font-light mb-2">{metric.value}</p>
          {metric.change && (
            <p
              className={`text-xs ${
                metric.trend === 'up'
                  ? 'text-green-600 dark:text-green-400'
                  : metric.trend === 'down'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {metric.change}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
