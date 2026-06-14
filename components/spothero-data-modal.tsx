'use client'

import { useEffect, useState } from 'react'
import { ChevronRight, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Venue {
  id: string
  name: string
  lat: number
  lon: number
  classification?: string
  lastPrice?: number
  availableSpaces?: number
}

interface SpotHeroDataModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SpotHeroDataModal({ isOpen, onClose }: SpotHeroDataModalProps) {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return

    const fetchVenues = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots`
        )
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
      } catch (error) {
        console.error('Failed to fetch venues:', error)
        setVenues([])
      } finally {
        setLoading(false)
      }
    }

    setLoading(true)
    fetchVenues()
  }, [isOpen])

  if (!isOpen) return null

  const handleViewData = () => {
    onClose()
    router.push('/spothero-data')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-lg shadow-xl max-h-[80vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-light text-slate-900 dark:text-slate-50">
            SpotHero Data
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p className="text-slate-600 dark:text-slate-400">Loading venues...</p>
          ) : venues.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400">No venues found. Run the scraper to populate data.</p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Tracked Venues ({venues.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-slate-900 dark:text-slate-50 mb-2">
                          {venue.name}
                        </h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          {venue.lastPrice && (
                            <p>Latest price: ${venue.lastPrice.toFixed(2)}</p>
                          )}
                          {venue.availableSpaces !== undefined && (
                            <p>Available spaces: {venue.availableSpaces}</p>
                          )}
                          {venue.classification && (
                            <p className="text-xs">
                              <span className={`inline-block px-2 py-1 rounded ${
                                venue.classification === 'High Activity Positive' ? 'bg-green-100 dark:bg-green-950 text-green-900 dark:text-green-100' :
                                venue.classification === 'High Activity Negative' ? 'bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-100' :
                                venue.classification === 'Volatile' ? 'bg-yellow-100 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100' :
                                'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                              }`}>
                                {venue.classification}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleViewData}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            View Full Data
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
