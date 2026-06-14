'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface ToolCardModalProps {
  isOpen: boolean
  onClose: () => void
  toolName: string
  toolImage: string
  toolDesc: string
  buttonText: string
  buttonAction?: () => void
  buttonRoute?: string
  isComingSoon?: boolean
}

export default function ToolCardModal({
  isOpen,
  onClose,
  toolName,
  toolImage,
  toolDesc,
  buttonText,
  buttonAction,
  buttonRoute,
  isComingSoon = false,
}: ToolCardModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  const handleButtonClick = () => {
    if (buttonAction) {
      buttonAction()
    } else if (buttonRoute) {
      onClose()
      router.push(buttonRoute)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal" role="dialog" aria-modal="true" style={{ maxWidth: '600px' }}>
        <div className="modal-head">
          <h3>{toolName}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <img
              src={toolImage}
              alt={toolName}
              style={{
                width: '100%',
                height: '300px',
                objectFit: 'cover',
                display: 'block',
              }}
            />
            {isComingSoon && (
              <div className="tool-thumb dev-overlay" style={{ position: 'absolute' }}>
                In Development
              </div>
            )}
          </div>

          <div style={{ padding: '24px 26px' }}>
            <p style={{ color: 'var(--text-2)', fontSize: '15px', marginBottom: '20px' }}>
              {toolDesc}
            </p>

            <button
              onClick={handleButtonClick}
              disabled={isComingSoon}
              style={{
                width: '100%',
                background: isComingSoon ? 'var(--pill)' : 'var(--blue)',
                color: isComingSoon ? 'var(--text-3)' : '#fff',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: isComingSoon ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-display)',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isComingSoon) {
                  e.currentTarget.style.background = 'var(--blue-deep)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isComingSoon) {
                  e.currentTarget.style.background = 'var(--blue)'
                }
              }}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
