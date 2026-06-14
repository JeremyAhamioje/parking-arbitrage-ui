'use client'

import { X } from 'lucide-react'
import { SignalFeed } from './signal-feed'

interface SignalFeedModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SignalFeedModal({ isOpen, onClose }: SignalFeedModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-lg shadow-xl max-h-[85vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-light text-slate-900 dark:text-slate-50 mb-1">
              Change Alerts
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              High-profile price spikes and inventory drops. Sorted by severity.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors flex-shrink-0 ml-4"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <SignalFeed />
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
