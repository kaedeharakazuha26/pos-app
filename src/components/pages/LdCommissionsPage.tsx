import { formatCurrency } from "../../pos-utils";
import type { LdCommission } from "../../types";
import { RecordTablePage } from "./RecordTablePage";

type Props = {
  records: LdCommission[];
  dateValue: string;
  onDateChange: (value: string) => void;
  onAdd: () => void;
};
export function LdCommissionsPage({
  records,
  dateValue,
  onDateChange,
  onAdd,
}: Props) {
  return (
    <RecordTablePage
      title="LD Commission"
      records={records}
      dateValue={dateValue}
      onDateChange={onDateChange}
      onAdd={onAdd}
      columns={[
        { label: "Employee", render: (record) => record.employee },
        { label: "Date", render: (record) => record.date },
        {
          label: "Category",
          render: (record) => record.category || record.reference,
        },
        { label: "Amount", render: (record) => formatCurrency(record.amount) },
      ]}
    />
  );
}
