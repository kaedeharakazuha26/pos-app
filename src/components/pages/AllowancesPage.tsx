import { formatCurrency } from '../../pos-utils'
import type { Allowance } from '../../types'
import { RecordTablePage } from './RecordTablePage'

type Props = { records: Allowance[]; dateValue: string; onDateChange: (value: string) => void; onAdd: () => void }
export function AllowancesPage({ records, dateValue, onDateChange, onAdd }: Props) {
  return <RecordTablePage title="Allowances" records={records} dateValue={dateValue} onDateChange={onDateChange} onAdd={onAdd} columns={[{ label: 'Employee', render: (record) => record.employee }, { label: 'Date', render: (record) => record.date }, { label: 'Amount', render: (record) => formatCurrency(record.amount) }, { label: 'Reason', render: (record) => record.reason }]} />
}
