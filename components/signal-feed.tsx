'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, AlertTriangle, Clock } from 'lucide-react'

interface Signal {
  id: string
  venue: string
  lot: string
  signalType: 'PRICE_SPIKE' | 'INVENTORY_DROP' | 'HIGH_PROFILE'
  priceBefore: number
  priceAfter: number
  priceChangePct: number
  spacesBefore: number
  spacesAfter: number
  spacesChangePct: number
  timestamp: string
  severity: number
}

export function SignalFeed() {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signals`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setSignals(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch signals:', error)
        setSignals([])
      } finally {
        setLoading(false)
      }
    }

    fetchSignals()
  }, [])

  if (loading) {
    return <div className="text-slate-600 dark:text-slate-400 py-8">Loading signals...</div>
  }

  if (signals.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg">
        <p className="text-slate-600 dark:text-slate-400">No signals detected. Run the scraper to populate.</p>
      </div>
    )
  }

  const getSignalColor = (type: string) => {
    switch (type) {
      case 'HIGH_PROFILE':
        return 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800'
      case 'PRICE_SPIKE':
        return 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800'
      case 'INVENTORY_DROP':
        return 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200 dark:border-yellow-800'
      default:
        return 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'
    }
  }

  const getSignalBadge = (type: string) => {
    if (type === 'HIGH_PROFILE') {
      return (
        <span className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
          🚨 HIGH PROFILE
        </span>
      )
    }
    return null
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 60) {
      return `${diffMins}m ago`
    }
    if (diffHours < 24) {
      return `${diffHours}h ago`
    }
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-3">
      {signals.map((signal) => (
        <div
          key={signal.id}
          className={`p-4 rounded-lg border ${getSignalColor(signal.signalType)} transition-all`}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-50">
                {signal.venue}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {signal.lot}
              </p>
            </div>
            {getSignalBadge(signal.signalType)}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            {/* Price Movement */}
            <div className="flex items-center gap-2">
              {signal.priceChangePct >= 0 ? (
                <TrendingUp className="w-4 h-4 text-red-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-green-500" />
              )}
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Price</p>
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  ${signal.priceBefore.toFixed(2)} → ${signal.priceAfter.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    signal.priceChangePct >= 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {signal.priceChangePct >= 0 ? '+' : ''}{signal.priceChangePct.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Spaces Movement */}
            <div className="flex items-center gap-2">
              {signal.spacesChangePct <= 0 ? (
                <AlertTriangle className="w-4 h-4 text-orange-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-green-500" />
              )}
              <div>
                <p className="text-xs text-slate-600 dark:text-slate-400">Spots</p>
                <p className="font-medium text-slate-900 dark:text-slate-50">
                  {signal.spacesBefore} → {signal.spacesAfter}
                </p>
                <p
                  className={`text-xs font-semibold ${
                    signal.spacesChangePct <= 0
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}
                >
                  {signal.spacesChangePct.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{formatTime(signal.timestamp)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
