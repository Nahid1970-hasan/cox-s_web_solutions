import React, { useState, useMemo } from 'react'
import '../../css/components/ui/Table.css'

/**
 * Reusable data table.
 * Columns: [{ field, header, sortableBody, sortable?, sortValue?, width?, style? }] or [{ key, label }].
 * - field/header/sortableBody: header = "Header", sortableBody = (rowData) => content
 * - sortable: if true, header shows sort icon and clicking toggles asc/desc
 * - sortValue: optional (row) => comparable value; default uses row[field]
 * - width: column width applied to th and td (e.g. "80px", "10rem", "15%")
 * - style: optional object applied to th and td (merged with width)
 * @param {array} columns - column config
 * @param {array} data - rows
 * @param {function} renderCell - optional (key, value, row) => ReactNode when column has no sortableBody
 * @param {function} renderHeader - optional (key) => ReactNode
 * @param {React.ReactNode} emptyMessage
 */
export default function Table({ columns = [], data = [], renderCell, renderHeader, emptyMessage = 'No data' }) {
  const [sortField, setSortField] = useState(null)
  const [sortDirection, setSortDirection] = useState('asc') // 'asc' | 'desc'

  const colKey = (col) => col.field ?? col.key

  const getCellStyle = (col) => {
    const base = col?.style ?? {}
    if (col?.width != null && col?.width !== '') {
      return { ...base, width: col.width, minWidth: col.width, maxWidth: col.width }
    }
    return base
  }

  const sortedData = useMemo(() => {
    if (!sortField || data.length === 0) return data
    const col = columns.find((c) => (c.field ?? c.key) === sortField)
    const getVal = (row) => {
      if (col?.sortValue && typeof col.sortValue === 'function') return col.sortValue(row)
      return row[sortField]
    }
    const compare = (a, b) => {
      const va = getVal(a)
      const vb = getVal(b)
      const na = va == null || va === ''
      const nb = vb == null || vb === ''
      if (na && nb) return 0
      if (na) return 1
      if (nb) return -1
      const mult = sortDirection === 'asc' ? 1 : -1
      if (typeof va === 'number' && typeof vb === 'number') return mult * (va - vb)
      const sa = String(va)
      const sb = String(vb)
      return mult * (sa.localeCompare(sb, undefined, { numeric: true }) || 0)
    }
    return [...data].sort(compare)
  }, [data, columns, sortField, sortDirection])

  const handleSort = (col) => {
    if (!col.sortable) return
    const key = colKey(col)
    setSortField(key)
    setSortDirection((prev) => (sortField === key && prev === 'asc' ? 'desc' : 'asc'))
  }

  const renderHeaderContent = (col) => {
    const key = colKey(col)
    const label = typeof renderHeader === 'function' ? (renderHeader(key) ?? (col.header ?? col.label)) : (col.header ?? col.label)
    if (!col.sortable) return label
    const isActive = sortField === key
    const arrow = isActive ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'
    return (
      <button
        type="button"
        className="ui-table-sort-header"
        onClick={() => handleSort(col)}
      >
        <span className="ui-table-sort-label">{label}</span>
        <span className="ui-table-sort-icon" aria-hidden>{arrow}</span>
      </button>
    )
  }

  return (
    <div className="ui-table-wrap">
      <div className="ui-table-scroll" style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <table className="ui-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const cellStyle = getCellStyle(col)
                return (
                  <th key={colKey(col)} style={Object.keys(cellStyle).length ? cellStyle : undefined}>
                    {renderHeaderContent(col)}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="ui-table-empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr key={row.id ?? rowIndex}>
                  {columns.map((col) => {
                    const key = colKey(col)
                    const content = typeof col.sortableBody === 'function'
                      ? col.sortableBody(row)
                      : (typeof renderCell === 'function' ? renderCell(key, row[key], row) : row[key])
                    const cellStyle = getCellStyle(col)
                    return (
                      <td key={key} style={Object.keys(cellStyle).length ? cellStyle : undefined}>
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
