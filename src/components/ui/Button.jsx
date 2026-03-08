import React from 'react'
import '../../css/components/ui/Button.css'

/**
 * Reusable button for the project.
 * @param {string} variant - 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'ghost'
 * @param {string} size - 'md' | 'sm'
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {boolean} disabled
 * @param {string} className - extra classes
 * @param {React.ReactNode} children
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  className = '',
  children,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`ui-btn ui-btn--${variant} ${size === 'sm' ? 'ui-btn--sm' : ''} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
