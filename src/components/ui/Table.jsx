import React from 'react'
import '../../css/components/ui/Table.css'

/**
 * Reusable data table.
 * Columns: [{ field, header, sortableBody, width?, style? }] or [{ key, label }].
 * - field/header/sortableBody: header = "Header", sortableBody = (rowData) => content
 * - width: column width applied to th and td (e.g. "80px", "10rem", "15%")
 * - style: optional object applied to th and td (merged with width)
 * @param {array} columns - [{ field, header, sortableBody, width?, style? }] or [{ key, label }]
 * @param {array} data - rows
 * @param {function} renderCell - optional (key, value, row) => ReactNode when column has no sortableBody
 * @param {function} renderHeader - optional (key) => ReactNode
 * @param {React.ReactNode} emptyMessage
 */
export default function Table({ columns = [], data = [], renderCell, renderHeader, emptyMessage = 'No data' }) {
  const colKey = (col) => col.field ?? col.key

  const getCellStyle = (col) => {
    const base = col?.style ?? {}
    if (col?.width != null && col?.width !== '') {
      return { ...base, width: col.width, minWidth: col.width, maxWidth: col.width }
    }
    return base
  }

  return (
    <div className="ui-table-wrap">
      <table className="ui-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const cellStyle = getCellStyle(col)
              return (
                <th key={colKey(col)} style={Object.keys(cellStyle).length ? cellStyle : undefined}>
                  {typeof renderHeader === 'function' ? (renderHeader(colKey(col)) ?? (col.header ?? col.label)) : (col.header ?? col.label)}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="ui-table-empty">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
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
  )
}
