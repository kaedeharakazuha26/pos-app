import { formatCurrency } from "../../pos-utils";
import type { Sale } from "../../types";

type Props = {
  records: Sale[];
  period: "daily" | "weekly" | "monthly" | "yearly";
  date: string;
  search: string;
  showVoids: boolean;
  canVoid: boolean;
  onShowVoids: (value: boolean) => void;
  onPeriodChange: (value: Props["period"]) => void;
  onDateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onReceipt: (sale: Sale) => void;
  onVoidSale: (saleId: string) => void;
};
export function SalesHistoryPage({
  records,
  period,
  date,
  search,
  showVoids,
  canVoid,
  onShowVoids,
  onPeriodChange,
  onDateChange,
  onSearchChange,
  onReceipt,
  onVoidSale,
}: Props) {
  return (
    <div className="panel">
      <div className="panel-header split-header">
        <h3>{showVoids ? "Voided Transactions" : "Sales History"}</h3>
        <div className="toolbar-inline">
          <select
            value={period}
            onChange={(event) =>
              onPeriodChange(event.target.value as Props["period"])
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
          <input
            type="search"
            placeholder="Search by transaction or cashier"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
          <button
            type="button"
            className="secondary-button"
            onClick={() => onShowVoids(!showVoids)}
          >
            {showVoids ? "View Active Sales" : "View Void Transactions"}
          </button>
        </div>
      </div>
      <p className="section-caption">
        Showing {showVoids ? "voided" : "active"} {period} sales for the
        selected date.
      </p>
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction #</th>
            <th>Date</th>
            <th>Cashier</th>
            <th>Total</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.length === 0 ? (
            <tr>
              <td colSpan={7}>No sales for this period.</td>
            </tr>
          ) : (
            records.map((sale) => (
              <tr key={sale.id}>
                <td>{sale.transactionNumber}</td>
                <td>{sale.saleDate}</td>
                <td>{sale.cashierName}</td>
                <td>{formatCurrency(sale.total)}</td>
                <td>{sale.paymentMethod}</td>
                <td>{sale.status}</td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => onReceipt(sale)}
                  >
                    Receipt
                  </button>
                  {canVoid && sale.status !== "void" && (
                    <button
                      type="button"
                      className="link-button danger-link"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Void ${sale.transactionNumber}? The sale will remain in history and stock will be restored.`,
                          )
                        )
                          onVoidSale(sale.id);
                      }}
                    >
                      Void
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
