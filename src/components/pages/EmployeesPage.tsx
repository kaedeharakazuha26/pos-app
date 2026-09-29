import type { Employee } from "../../types";
import { RecordTablePage } from "./RecordTablePage";

type Props = {
  records: Employee[];
  dateValue: string;
  onDateChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
};
export function EmployeesPage({
  records,
  dateValue,
  onDateChange,
  onAdd,
  onDelete,
  canDelete,
}: Props) {
  return (
    <RecordTablePage
      title="Employees"
      records={records}
      dateValue={dateValue}
      onDateChange={onDateChange}
      onAdd={onAdd}
      onDelete={onDelete}
      canDelete={canDelete}
      columns={[
        { label: "ID", render: (record) => record.employeeId },
        { label: "Name", render: (record) => record.fullName },
        { label: "Role", render: (record) => record.role },
        { label: "Contact", render: (record) => record.contact },
        { label: "Status", render: (record) => record.status },
      ]}
    />
  );
}
