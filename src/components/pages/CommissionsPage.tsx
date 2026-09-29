import { formatCurrency } from '../../pos-utils'
import type { Commission } from '../../types'
import { RecordTablePage } from './RecordTablePage'

type Props = { records: Commission[]; dateValue: string; onDateChange: (value: string) => void; onAdd: () => void }
export function CommissionsPage({ records, dateValue, onDateChange, onAdd }: Props) {
  return <RecordTablePage title="Commissions" records={records} dateValue={dateValue} onDateChange={onDateChange} onAdd={onAdd} columns={[{ label: 'Employee', render: (record) => record.employee }, { label: 'Date', render: (record) => record.date }, { label: 'Category', render: (record) => record.category || record.salesReference }, { label: 'Rate', render: (record) => `${record.rate * 100}%` }, { label: 'Amount', render: (record) => formatCurrency(record.amount) }]} />
}
