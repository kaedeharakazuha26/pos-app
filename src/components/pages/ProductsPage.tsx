import { formatCurrency } from "../../pos-utils";
import type { Product } from "../../types";
import { RecordTablePage } from "./RecordTablePage";

type Props = {
  records: Product[];
  dateValue: string;
  onDateChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  canDelete: boolean;
};
export function ProductsPage({
  records,
  dateValue,
  onDateChange,
  onAdd,
  onDelete,
  canDelete,
}: Props) {
  return (
    <RecordTablePage
      title="Products"
      records={records}
      dateValue={dateValue}
      onDateChange={onDateChange}
      onAdd={onAdd}
      onDelete={onDelete}
      canDelete={canDelete}
      columns={[
        { label: "SKU", render: (record) => record.sku },
        { label: "Name", render: (record) => record.name },
        { label: "Category", render: (record) => record.category },
        {
          label: "Price",
          render: (record) => formatCurrency(record.sellingPrice),
        },
        { label: "Stock", render: (record) => record.stock },
        { label: "Status", render: (record) => record.status },
      ]}
    />
  );
}
