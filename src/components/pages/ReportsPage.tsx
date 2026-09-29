import { formatCurrency } from "../../pos-utils";

export type ReportMenu =
  | "sales"
  | "void"
  | "expenses"
  | "allowance"
  | "commission"
  | "ld-commission";
export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";
export type ReportRow = {
  id: string;
  date: string;
  reference: string;
  description: string;
  amount: number;
  status?: string;
};

type Props = {
  rows: ReportRow[];
  menu: ReportMenu;
  period: ReportPeriod;
  date: string;
  onMenuChange: (value: ReportMenu) => void;
  onPeriodChange: (value: ReportPeriod) => void;
  onDateChange: (value: string) => void;
  onPrint: () => void;
  onDelete: (row: ReportRow) => void;
  canDelete: boolean;
};

export function ReportsPage({
  rows,
  menu,
  period,
  date,
  onMenuChange,
  onPeriodChange,
  onDateChange,
  onPrint,
  onDelete,
  canDelete,
}: Props) {
  return (
    <div className="panel">
      <div className="panel-header split-header">
        <h3>Reports</h3>
        <div className="toolbar-inline">
          <select
            value={menu}
            onChange={(event) => onMenuChange(event.target.value as ReportMenu)}
          >
            <option value="sales">Sales</option>
            <option value="void">Void Transactions</option>
            <option value="expenses">Expenses</option>
            <option value="allowance">Allowance</option>
            <option value="commission">Commission</option>
            <option value="ld-commission">LD Commission</option>
          </select>
          <select
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as ReportPeriod)
            }
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(event) => onDateChange(event.target.value)}
          />
          <button type="button" className="secondary-button" onClick={onPrint}>
            Print
          </button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            {canDelete && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={canDelete ? 6 : 5}>
                No report records for this period.
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={row.id}>
                <td>{row.date}</td>
                <td>{row.reference}</td>
                <td>{row.description}</td>
                <td>{formatCurrency(row.amount)}</td>
                <td>{row.status || "active"}</td>
                {canDelete && (
                  <td>
                    <button
                      type="button"
                      className="link-button danger-link"
                      onClick={() => {
                        if (window.confirm("Delete this report record?"))
                          onDelete(row);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
