'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Bell, CheckCircle, AlertCircle, TrendingDown } from 'lucide-react'

interface Alert {
  id: string
  type: 'price_drop' | 'price_spike' | 'availability'
  venue: string
  message: string
  value: string
  time: string
  read: boolean
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alerts`)
        const data = await res.json()
        setAlerts(data)
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
      }
    }

    fetchAlerts()
  }, [])

  const filteredAlerts = alerts.filter(
    (a) => filter === 'all' || !a.read
  )

  const unreadCount = alerts.filter((a) => !a.read).length

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light tracking-tight mb-3">Alerts</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {unreadCount > 0 && (
                <>You have {unreadCount} unread alert{unreadCount > 1 ? 's' : ''}</>
              )}
              {unreadCount === 0 && <>All alerts read</>}
            </p>
          </div>
          <div className="relative">
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Alerts
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Unread
          </button>
        </div>

        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">
                {filter === 'unread'
                  ? 'No unread alerts'
                  : 'No alerts yet'}
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const getIcon = () => {
                switch (alert.type) {
                  case 'price_drop':
                    return <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                  case 'price_spike':
                    return <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  case 'availability':
                    return <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  default:
                    return null
                }
              }

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    alert.read
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30'
                      : 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon()}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold">{alert.venue}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">
                        {alert.message}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {alert.value}
                        </span>
                        {!alert.read && (
                          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
