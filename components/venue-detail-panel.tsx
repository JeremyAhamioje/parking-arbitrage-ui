'use client'

import { useEffect, useState } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'

interface Snapshot {
  price: number
  spaces: number
  scraped_at: string
}

interface Signal {
  id: string
  signal_type: string
  price_before: number
  price_after: number
  price_change_pct: number
  spaces_before: number
  spaces_after: number
  spaces_change_pct: number
  tagged_at: string
}

interface VenueDetailData {
  venueName: string
  snapshots: Snapshot[]
  signals: Signal[]
  snapshotCount: number
}

interface VenueDetailPanelProps {
  venueName: string
  isOpen: boolean
  onClose: () => void
}

export function VenueDetailPanel({ venueName, isOpen, onClose }: VenueDetailPanelProps) {
  const [data, setData] = useState<VenueDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isOpen || !venueName) return

    const fetchDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/venue-snapshots/${encodeURIComponent(venueName)}`
        )
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setData(data)
      } catch (error) {
        console.error('Failed to fetch venue details:', error)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchDetails()
  }, [isOpen, venueName])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-end">
      <div className="w-full max-w-md h-full bg-white dark:bg-slate-900 shadow-lg overflow-hidden flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
            {venueName}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400">Loading...</p>
          ) : !data ? (
            <p className="text-slate-600 dark:text-slate-400">No data found</p>
          ) : (
            <>
              {/* Snapshots */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                  Historical Snapshots
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {data.snapshots.map((snap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-600 dark:text-slate-400">
                          {new Date(snap.scraped_at).toLocaleDateString()}
                        </span>
                        <span className="font-medium text-slate-900 dark:text-slate-50">
                          ${snap.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        {snap.spaces} spaces available
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signals */}
              {data.signals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
                    HIGH PROFILE Signals
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {data.signals.map((signal) => (
                      <div
                        key={signal.id}
                        className={`p-3 rounded-lg text-sm ${
                          signal.signal_type === 'HIGH_PROFILE'
                            ? 'bg-red-50 dark:bg-red-950/30'
                            : 'bg-slate-50 dark:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-slate-900 dark:text-slate-50">
                            {signal.signal_type}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {new Date(signal.tagged_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                          <div className="flex items-center justify-between">
                            <span>Price:</span>
                            <span className="font-medium">
                              ${signal.price_before.toFixed(2)} → ${signal.price_after.toFixed(2)}
                              {signal.price_change_pct >= 0 ? (
                                <TrendingUp className="w-3 h-3 ml-1 text-red-500 inline" />
                              ) : (
                                <TrendingDown className="w-3 h-3 ml-1 text-green-500 inline" />
                              )}
                              {' '}({signal.price_change_pct > 0 ? '+' : ''}{signal.price_change_pct.toFixed(1)}%)
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Spaces:</span>
                            <span className="font-medium">
                              {signal.spaces_before} → {signal.spaces_after} ({signal.spaces_change_pct.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {data.signals.length === 0 && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  No HIGH PROFILE signals detected for this venue yet.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
