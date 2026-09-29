import type { ReactNode } from 'react'

export type RecordColumn<T> = {
  label: string
  render: (record: T) => ReactNode
}

type Props<T extends { id: string }> = {
  title: string
  records: T[]
  columns: RecordColumn<T>[]
  dateValue: string
  onDateChange: (value: string) => void
  onAdd: () => void
  onDelete?: (id: string) => void
  canDelete?: boolean
}

export function RecordTablePage<T extends { id: string }>({ title, records, columns, dateValue, onDateChange, onAdd, onDelete, canDelete = false }: Props<T>) {
  return (
    <div className="panel">
      <div className="panel-header split-header">
        <h3>{title}</h3>
        <div className="toolbar-inline">
          <input type="date" value={dateValue === 'all' ? '' : dateValue} onChange={(event) => onDateChange(event.target.value || 'all')} />
          <button type="button" className="primary-button" onClick={onAdd}>Add {title.replace(/s$/, '')}</button>
        </div>
      </div>
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.label}>{column.label}</th>)}{canDelete && onDelete && <th>Actions</th>}</tr></thead>
        <tbody>
          {records.length === 0 ? <tr><td colSpan={columns.length + (canDelete && onDelete ? 1 : 0)}>No records for the selected date.</td></tr> : records.map((record) => <tr key={record.id}>{columns.map((column) => <td key={column.label}>{column.render(record)}</td>)}{canDelete && onDelete && <td><button type="button" className="link-button danger-link" onClick={() => { if (window.confirm(`Delete this ${title.toLowerCase().replace(/s$/, '')}?`)) onDelete(record.id) }}>Delete</button></td>}</tr>)}
        </tbody>
      </table>
    </div>
  )
}
