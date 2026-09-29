import { formatCurrency } from "../../pos-utils";
import type { Expense } from "../../types";
import { RecordTablePage } from "./RecordTablePage";

type Props = {
  records: Expense[];
  dateValue: string;
  onDateChange: (value: string) => void;
  onAdd: () => void;
};
export function ExpensesPage({
  records,
  dateValue,
  onDateChange,
  onAdd,
}: Props) {
  return (
    <RecordTablePage
      title="Expenses"
      records={records}
      dateValue={dateValue}
      onDateChange={onDateChange}
      onAdd={onAdd}
      columns={[
        { label: "Date", render: (record) => record.date },
        { label: "Category", render: (record) => record.category },
        { label: "Description", render: (record) => record.description },
        { label: "Amount", render: (record) => formatCurrency(record.amount) },
        { label: "Payee", render: (record) => record.payee },
      ]}
    />
  );
}
