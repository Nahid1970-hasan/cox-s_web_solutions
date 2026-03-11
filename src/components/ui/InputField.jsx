import React from 'react'
import '../../css/components/ui/InputField.css'

/**
 * Reusable input/select/textarea field for forms.
 * @param {string} label
 * @param {string} type - 'text' | 'email' | 'password' | 'number'
 * @param {string} name
 * @param {string} id
 * @param {string} value
 * @param {function} onChange
 * @param {string} placeholder
 * @param {string} error
 * @param {boolean} required
 * @param {boolean} disabled
 * @param {boolean} search - show search icon
 * @param {boolean} textarea - render as <textarea>
 * @param {number} rows - textarea rows (default 4)
 * @param {array} options - for select: [{ value, label }]
 */
export default function InputField({
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  search = false,
  textarea = false,
  rows = 4,
  options,
  ...props
}) {
  const inputId = id || name
  const isSelect = Array.isArray(options)

  return (
    <div className={`ui-input-wrap ${error ? 'ui-input-wrap--error' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="ui-input-label">
          {label}
          {required && <span className="ui-input-required">*</span>}
        </label>
      )}
      <div className="ui-input-inner">
        {search && !textarea && <span className="ui-input-icon" aria-hidden>🔍</span>}
        {isSelect ? (
          <select
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="ui-input ui-input--select"
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : textarea ? (
          <textarea
            id={inputId}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className="ui-input ui-input--textarea"
            {...props}
          />
        ) : (
          <input
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className="ui-input"
            data-search={search}
            {...props}
          />
        )}
      </div>
      {error && <span className="ui-input-error">{error}</span>}
    </div>
  )
}

/** Convenience component: InputField with textarea=true. Same props as InputField (label, name, value, onChange, rows, placeholder, etc.). */
export function TextareaField(props) {
  return <InputField {...props} textarea />
}
