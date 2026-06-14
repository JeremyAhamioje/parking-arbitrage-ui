'use client'

import { BarChart3, AlertCircle, MapPin, TrendingUp, Lock } from 'lucide-react'

interface Tool {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  status: 'active' | 'coming-soon'
  color: string
}

export function ToolsGrid() {
  const tools: Tool[] = [
    {
      id: 'parking-monitor',
      name: 'Parking Monitor',
      description:
        'Real-time parking availability and price tracking across 50+ major venues',
      icon: MapPin,
      status: 'active',
      color: 'blue',
    },
    {
      id: 'price-alerts',
      name: 'Price Alerts',
      description:
        'Get notified when parking prices drop or spike at your favorite venues',
      icon: AlertCircle,
      status: 'active',
      color: 'green',
    },
    {
      id: 'spothero-integration',
      name: 'SpotHero Data',
      description:
        'Integrated parking data from SpotHero API with real-time pricing',
      icon: BarChart3,
      status: 'active',
      color: 'purple',
    },
    {
      id: 'ticketmaster',
      name: 'Ticketmaster Events',
      description:
        'Detect new event announcements and on-sale dates automatically',
      icon: TrendingUp,
      status: 'coming-soon',
      color: 'orange',
    },
    {
      id: 'waze-integration',
      name: 'Waze Integration',
      description:
        'Get real-time traffic and parking difficulty data from Waze',
      icon: MapPin,
      status: 'coming-soon',
      color: 'yellow',
    },
    {
      id: 'advanced-analytics',
      name: 'Advanced Analytics',
      description:
        'Historical trends, predictive pricing models, and opportunity scoring',
      icon: BarChart3,
      status: 'coming-soon',
      color: 'indigo',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tools.map((tool) => {
        const Icon = tool.icon
        const colorMap = {
          blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
          green:
            'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
          purple:
            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
          orange:
            'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
          yellow:
            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
          indigo:
            'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
        }

        return (
          <div
            key={tool.id}
            className={`p-6 rounded-lg border ${
              tool.status === 'coming-soon'
                ? 'border-slate-200 dark:border-slate-800 opacity-60'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            } bg-white dark:bg-slate-900 transition-all cursor-pointer group hover:shadow-md dark:hover:shadow-xl`}
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className={`p-3 rounded-lg ${
                  colorMap[tool.color as keyof typeof colorMap]
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              {tool.status === 'coming-soon' && (
                <span className="px-2 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded">
                  Coming Soon
                </span>
              )}
            </div>

            <h3 className="font-semibold mb-2 text-lg">{tool.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {tool.description}
            </p>

            {tool.status === 'active' && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button className="w-full px-3 py-2 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  View Details
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
