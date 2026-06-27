'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/header'
import { Bell, CheckCircle, AlertCircle, TrendingDown, TrendingUp, Ban, ExternalLink } from 'lucide-react'

interface Alert {
  id: string
  type: string
  venue: string
  message: string
  value: string
  time?: string
  createdAt?: string
  window?: { from: string | null; to: string | null }
  source?: string | null
  context?: string | null
  signalType?: string | null
  confidence?: string | null
  eventName?: string | null
  listingUrl?: string | null
  listingUrlKind?: 'exact' | 'event' | null
  read: boolean
}

const API = process.env.NEXT_PUBLIC_API_URL

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'soldout', label: '🚫 Sold Out' },
  { key: 'volatility', label: '📈 Volatility' },
  { key: 'pricedrop', label: '📉 Price drops' },
] as const
type Category = (typeof CATEGORIES)[number]['key']

const SINCE_OPTIONS = [
  { key: 'all', label: 'All time' },
  { key: '1', label: 'Last hour' },
  { key: '24', label: 'Last 24h' },
  { key: '168', label: 'Last 7 days' },
]
const SOURCE_LABEL: Record<string, string> = { spothero: 'SpotHero', parkwhiz: 'ParkWhiz', way: 'Way' }

// Format an ISO timestamp in the viewer's own timezone (e.g. "Jun 25, 3:00 AM").
function fmtTime(iso?: string | null) {
  if (!iso) return null
  const d = new Date(iso)
  if (isNaN(d.getTime())) return null
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// The two runs being compared (prev run → this run) when known, else the single
// detection time — never a vague "just now".
function rangeLabel(a: Alert) {
  const from = fmtTime(a.window?.from)
  const to = fmtTime(a.window?.to || a.createdAt || a.time)
  if (from && to) return `${from} → ${to}`
  return to || ''
}

// "where it came from" — event-context vs generic scrape, and which platform.
function provLabel(a: Alert) {
  const ctx = a.context === 'event' ? 'Event context' : 'Generic'
  const src = a.source ? SOURCE_LABEL[a.source] || a.source : null
  const base = src ? `${ctx} · ${src}` : ctx
  // Show WHICH event drove an event-context alert (was just "Event context · …").
  return a.eventName ? `${base} · ${a.eventName}` : base
}

// How much to trust a sold-out alert. 'confirmed' = direct platform signal
// (SpotHero count→0). 'likely' = lot vanished while the rest of the event
// scraped fine. 'unverified' = run looked partial, so it may be a scrape gap
// rather than a real sellout — verify before pulling a StubHub listing.
const CONFIDENCE: Record<string, { label: string; cls: string }> = {
  confirmed:  { label: 'Confirmed',          cls: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  likely:     { label: 'Inferred',           cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  unverified: { label: 'Unverified · verify', cls: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 ring-1 ring-amber-400/60' },
}

const selectCls =
  'px-3 py-2 rounded-lg text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 focus:outline-none'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [category, setCategory] = useState<Category>('all')
  const [context, setContext] = useState<'all' | 'event' | 'generic'>('all')
  const [source, setSource] = useState<'all' | 'spothero' | 'parkwhiz' | 'way'>('all')
  const [since, setSince] = useState<string>('all')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [loading, setLoading] = useState(true)

  // Category, context, source and time are server-side filters (so high-value
  // alerts surface even when buried under thousands of price moves); "unread" is
  // a client-side view filter on the fetched set.
  useEffect(() => {
    const fetchAlerts = async () => {
      setLoading(true)
      try {
        const p = new URLSearchParams()
        if (category !== 'all') p.set('category', category)
        if (context !== 'all') p.set('context', context)
        if (source !== 'all') p.set('source', source)
        if (since !== 'all') p.set('since', since)
        const qs = p.toString()
        const res = await fetch(`${API}/api/alerts${qs ? `?${qs}` : ''}`)
        const data = await res.json()
        setAlerts(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to fetch alerts:', error)
        setAlerts([])
      } finally {
        setLoading(false)
      }
    }
    fetchAlerts()
  }, [category, context, source, since])

  const filteredAlerts = onlyUnread ? alerts.filter((a) => !a.read) : alerts
  const unreadCount = alerts.filter((a) => !a.read).length

  // Persist read state (alerts are NEVER deleted — they stay in the feed). Tell
  // the navbar bell to refresh its badge immediately.
  const markAllRead = async () => {
    try {
      await fetch(`${API}/api/alerts/read`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({}),
      })
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))
      window.dispatchEvent(new Event('alerts:refresh'))
    } catch (error) {
      console.error('Failed to mark alerts read:', error)
    }
  }

  const emptyText =
    category === 'soldout'
      ? 'No sold-out alerts in this view — they appear the moment a lot you track sells out on the source platform.'
      : onlyUnread
      ? 'No unread alerts in this view.'
      : 'No alerts in this view.'

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-4xl font-light tracking-tight mb-2">Alerts</h1>
          <p className="text-slate-600 dark:text-slate-400">
            {filteredAlerts.length} shown · {unreadCount} unread in view
          </p>
        </div>

        {/* Category tabs */}
        <div className="mb-3 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const active = category === c.key
            const activeCls = c.key === 'soldout' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
            return (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  active
                    ? activeCls
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {c.label}
              </button>
            )
          })}
        </div>

        {/* Secondary filters: time · source · context · unread · mark read */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <select className={selectCls} value={since} onChange={(e) => setSince(e.target.value)}>
            {SINCE_OPTIONS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <select className={selectCls} value={source} onChange={(e) => setSource(e.target.value as any)}>
            <option value="all">All platforms</option>
            <option value="spothero">SpotHero</option>
            <option value="parkwhiz">ParkWhiz</option>
            <option value="way">Way</option>
          </select>
          <select className={selectCls} value={context} onChange={(e) => setContext(e.target.value as any)}>
            <option value="all">Any context</option>
            <option value="event">Event context</option>
            <option value="generic">Generic</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer select-none">
            <input type="checkbox" checked={onlyUnread} onChange={(e) => setOnlyUnread(e.target.checked)} />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="ml-auto px-4 py-2 rounded-lg font-medium text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading…</div>
          ) : filteredAlerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">{emptyText}</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isSoldOut = alert.signalType === 'SOLD_OUT' || alert.signalType === 'INVENTORY_THINNING'
              const isUnverified = alert.confidence === 'unverified'
              const conf = alert.confidence ? CONFIDENCE[alert.confidence] : null
              const getIcon = () => {
                if (isUnverified) return <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                if (isSoldOut) return <Ban className="w-5 h-5 text-red-600 dark:text-red-400" />
                switch (alert.type) {
                  case 'price_drop':
                    return <TrendingDown className="w-5 h-5 text-green-600 dark:text-green-400" />
                  case 'price_spike':
                    return <TrendingUp className="w-5 h-5 text-red-600 dark:text-red-400" />
                  case 'availability':
                  case 'availability_drop':
                    return <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  default:
                    return <AlertCircle className="w-5 h-5 text-slate-400" />
                }
              }

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isUnverified
                      ? 'border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20'
                      : isSoldOut
                      ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20'
                      : alert.read
                      ? 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30'
                      : 'border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {getIcon()}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <h3 className="font-semibold truncate">{alert.venue}</h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {rangeLabel(alert)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">{alert.message}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{alert.value}</span>
                        {/* provenance: where it came from */}
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full ${
                            alert.context === 'event'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {provLabel(alert)}
                        </span>
                        {/* confidence: how much to trust this sold-out signal */}
                        {conf && (
                          <span className={`text-[11px] px-2 py-0.5 rounded-full ${conf.cls}`}>
                            {conf.label}
                          </span>
                        )}
                        {!alert.read && (
                          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded">New</span>
                        )}
                        {/* deep link to the listing on the buying platform */}
                        {alert.listingUrl && (
                          <a
                            href={alert.listingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={
                              alert.source === 'way'
                                ? "Way opens at today's date — set it to the event date before booking"
                                : 'Open this listing on the platform'
                            }
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {alert.listingUrlKind === 'exact'
                              ? `Open lot on ${SOURCE_LABEL[alert.source || ''] || 'platform'}`
                              : `View event on ${SOURCE_LABEL[alert.source || ''] || 'platform'}`}
                          </a>
                        )}
                        {/* Way lot pages open on TODAY's date — nudge to set the event date so
                            nobody books the wrong day (the unfulfillable-order trap). */}
                        {alert.source === 'way' && alert.listingUrl && (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                            ⚠ opens at today’s date — set it to the event date
                          </span>
                        )}
                        {/* Way opens on today's date — nudge to set the event date */}
                        {alert.listingUrl && alert.source === 'way' && (
                          <span
                            title="Way opens at today's date — set it to the event date before booking"
                            className="text-[10px] font-semibold text-amber-700 dark:text-amber-400"
                          >
                            ⚠ set event date
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
