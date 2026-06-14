'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { VenueDetailPanel } from './venue-detail-panel'

interface Venue {
  name: string
  classification: string
  color: string
  snapshotCount: number
  avgPrice?: number
  minPrice?: number
  maxPrice?: number
}

interface ChartData {
  time: string
  [key: string]: string | number
}

export function PricingChart() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const fetchSnapshots = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/snapshots`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setVenues(data.venues || [])
        setChartData(data.chartData || [])
      } catch (error) {
        console.error('Failed to fetch snapshots:', error)
        setVenues([])
        setChartData([])
      } finally {
        setLoading(false)
      }
    }

    fetchSnapshots()
  }, [])

  if (loading) {
    return (
      <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400">Loading chart...</p>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p className="text-slate-600 dark:text-slate-400 text-center py-12">
          Monitoring started. Price trends will appear after the first few scraper runs.
        </p>
      </div>
    )
  }

  // Filter venues with sufficient data (2+ snapshots)
  const venuesWithData = venues.filter((v) => v.snapshotCount >= 2)
  const classificationLegend = [
    { label: 'Positive Trending', color: '#22c55e' },
    { label: 'Negative Trending', color: '#ef4444' },
    { label: 'Volatile', color: '#eab308' },
    { label: 'Flat / Low Activity', color: '#9ca3af' },
  ]

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Venue Price Trends
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any line to view detailed snapshots and signals for that venue
          </p>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-4">
          {classificationLegend.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              stroke="#94a3b8"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              stroke="#94a3b8"
              label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #475569',
                borderRadius: '6px',
              }}
              labelStyle={{ color: '#e2e8f0' }}
            />
            {venuesWithData.map((venue) => (
              <Line
                key={venue.name}
                type="monotone"
                dataKey={venue.name}
                stroke={venue.color}
                dot={false}
                strokeWidth={2}
                isAnimationActive={false}
                onClick={() => {
                  setSelectedVenue(venue.name)
                  setPanelOpen(true)
                }}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Stats */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 dark:text-slate-400">Venues Tracked</p>
              <p className="font-medium text-lg">{venuesWithData.length}</p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Avg Price</p>
              <p className="font-medium text-lg">
                ${(venuesWithData.reduce((sum, v) => sum + (v.avgPrice || 0), 0) / (venuesWithData.length || 1)).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-slate-600 dark:text-slate-400">Snapshots</p>
              <p className="font-medium text-lg">{chartData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedVenue && (
        <VenueDetailPanel
          venueName={selectedVenue}
          isOpen={panelOpen}
          onClose={() => {
            setPanelOpen(false)
            setSelectedVenue(null)
          }}
        />
      )}
    </div>
  )
}
