import React, { useEffect } from 'react'
import '../../css/components/ui/Modal.css'

/**
 * Reusable modal dialog.
 * @param {boolean} open
 * @param {function} onClose
 * @param {string} title
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {React.ReactNode} children
 * @param {string} className
 * @param {string|number} width - optional custom max-width (e.g. "720px" or 720)
 */
export default function Modal({ open, onClose, title, size = 'md', children, className = '', width }) {
  useEffect(() => {
    if (open) {
      const handleEscape = (e) => { if (e.key === 'Escape') onClose() }
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="ui-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'ui-modal-title' : undefined}
    >
      <div
        className={`ui-modal ui-modal--${size} ${className}`.trim()}
        style={width != null ? { maxWidth: typeof width === 'number' ? `${width}px` : width } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ui-modal-header">
          {title && (
            <h3 id="ui-modal-title" className="ui-modal-title">{title}</h3>
          )}
          <button
            type="button"
            className="ui-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="ui-modal-body">
          {children}
        </div>
      </div>
    </div>
  )
}
