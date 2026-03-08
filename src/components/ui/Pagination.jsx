import React from 'react'
import Button from './Button'
import '../../css/components/ui/Pagination.css'

/**
 * Reusable pagination controls.
 * @param {number} page - current page (1-based)
 * @param {number} totalPages
 * @param {function} onPageChange - (page) => void
 * @param {number} rowsPerPage
 * @param {array} rowsPerPageOptions - [5, 10, 25, 50]
 * @param {function} onRowsPerPageChange
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  rowsPerPage,
  rowsPerPageOptions = [5, 10, 25, 50],
  onRowsPerPageChange,
}) {
  return (
    <div className="ui-pagination">
      <div className="ui-pagination-nav">
        <Button variant="ghost" size="sm" onClick={() => onPageChange(1)} disabled={page <= 1}>«</Button>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>‹</Button>
        <span className="ui-pagination-current">{page}</span>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>›</Button>
        <Button variant="ghost" size="sm" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages}>»</Button>
      </div>
      {onRowsPerPageChange && (
        <div className="ui-pagination-rows">
          <label htmlFor="ui-pagination-rows-select">Choose</label>
          <select
            id="ui-pagination-rows-select"
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="ui-pagination-select"
          >
            {rowsPerPageOptions.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
