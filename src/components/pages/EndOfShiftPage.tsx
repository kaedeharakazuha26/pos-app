import { useState } from "react";
import { jsPDF } from "jspdf";
import { formatCurrency } from "../../pos-utils";

type Props = {
  openShift: { openingCash: number; businessDate: string } | null;
  sales: {
    saleDate: string;
    total: number;
    discount: number;
    paymentMethod: string;
    status?: string;
    items: { productName: string; quantity: number; lineTotal: number }[];
  }[];
  expenses: {
    date: string;
    amount: number;
    category: string;
    description: string;
    payee: string;
  }[];
  allowances: {
    date: string;
    amount: number;
    employee: string;
    reason: string;
  }[];
  commissions: {
    date: string;
    amount: number;
    employee: string;
    category?: string;
    salesReference: string;
  }[];
  ldCommissions: {
    date: string;
    amount: number;
    employee: string;
    category?: string;
    reference: string;
  }[];
  includeCommissions: boolean;
  includeLdCommissions: boolean;
  form: { actualEndingCash: string; notes: string };
  setForm: (value: { actualEndingCash: string; notes: string }) => void;
  onClose: () => void;
};

type ReportValues = {
  date: string;
  sales: number;
  expenses: number;
  allowances: number;
  commissions: number;
  ldCommissions: number;
  netReport: number;
  expectedCash: number;
  variance: number;
};

function ReportSummary({
  values,
  includeCommissions,
  includeLdCommissions,
}: {
  values: ReportValues;
  includeCommissions: boolean;
  includeLdCommissions: boolean;
}) {
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <span>Sales</span>
        <strong>{formatCurrency(values.sales)}</strong>
      </div>
      <div className="stat-card">
        <span>Expenses</span>
        <strong>{formatCurrency(values.expenses)}</strong>
      </div>
      <div className="stat-card">
        <span>Allowances</span>
        <strong>{formatCurrency(values.allowances)}</strong>
      </div>
      {includeCommissions && (
        <div className="stat-card">
          <span>Commission</span>
          <strong>{formatCurrency(values.commissions)}</strong>
        </div>
      )}
      {includeLdCommissions && (
        <div className="stat-card">
          <span>LD Commission</span>
          <strong>{formatCurrency(values.ldCommissions)}</strong>
        </div>
      )}
      <div className="stat-card">
        <span>Net Report</span>
        <strong>{formatCurrency(values.netReport)}</strong>
      </div>
      <div className="stat-card">
        <span>Expected Cash</span>
        <strong>{formatCurrency(values.expectedCash)}</strong>
      </div>
      <div className="stat-card">
        <span>Variance</span>
        <strong>{formatCurrency(values.variance)}</strong>
      </div>
    </div>
  );
}

export function EndOfShiftPage({
  openShift,
  sales,
  expenses,
  allowances,
  commissions,
  ldCommissions,
  includeCommissions,
  includeLdCommissions,
  form,
  setForm,
  onClose,
}: Props) {
  const [reviewOpen, setReviewOpen] = useState(false);
  if (!openShift)
    return (
      <div className="empty-state-box">
        <h3>Register Closed</h3>
        <p>No active shift is available to close.</p>
      </div>
    );

  const date = openShift.businessDate;
  const shiftSales = sales.filter(
    (sale) => sale.saleDate.slice(0, 10) === date && sale.status !== "void",
  );
  const salesTotal = shiftSales.reduce((sum, sale) => sum + sale.total, 0);
  const cashSales = shiftSales
    .filter((sale) => sale.paymentMethod === "cash")
    .reduce((sum, sale) => sum + sale.total, 0);
  const expensesTotal = expenses
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const allowancesTotal = allowances
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const commissionsTotal = includeCommissions
    ? commissions
        .filter((entry) => entry.date === date)
        .reduce((sum, entry) => sum + entry.amount, 0)
    : 0;
  const ldCommissionsTotal = includeLdCommissions
    ? ldCommissions
        .filter((entry) => entry.date === date)
        .reduce((sum, entry) => sum + entry.amount, 0)
    : 0;
  const netReport =
    salesTotal -
    expensesTotal -
    allowancesTotal -
    commissionsTotal -
    ldCommissionsTotal;
  const expectedCash =
    openShift.openingCash +
    cashSales -
    expensesTotal -
    allowancesTotal -
    commissionsTotal -
    ldCommissionsTotal;
  const variance = Number(form.actualEndingCash || 0) - expectedCash;
  const values: ReportValues = {
    date,
    sales: salesTotal,
    expenses: expensesTotal,
    allowances: allowancesTotal,
    commissions: commissionsTotal,
    ldCommissions: ldCommissionsTotal,
    netReport,
    expectedCash,
    variance,
  };
  const productTotals = new Map<string, { quantity: number; amount: number }>();
  shiftSales.forEach((sale) =>
    sale.items.forEach((item) => {
      const current = productTotals.get(item.productName) || {
        quantity: 0,
        amount: 0,
      };
      productTotals.set(item.productName, {
        quantity: current.quantity + item.quantity,
        amount: current.amount + item.lineTotal,
      });
    }),
  );
  const productRows = [...productTotals.entries()];
  const expenseRows = expenses.filter((entry) => entry.date === date);
  const allowanceRows = allowances.filter((entry) => entry.date === date);
  const commissionRows = includeCommissions
    ? commissions.filter((entry) => entry.date === date)
    : [];
  const ldCommissionRows = includeLdCommissions
    ? ldCommissions.filter((entry) => entry.date === date)
    : [];

  const exportPdfAndClose = () => {
    const pdf = new jsPDF();
    let y = 20;
    pdf.setFontSize(18);
    pdf.text("End of Day Report", 20, y);
    y += 10;
    pdf.setFontSize(11);
    pdf.text(`Business date: ${values.date}`, 20, y);
    y += 10;
    const rows: Array<[string, number]> = [
      ["Sales", values.sales],
      ["Expenses", values.expenses],
      ["Allowances", values.allowances],
    ];
    if (includeCommissions) rows.push(["Commission", values.commissions]);
    if (includeLdCommissions)
      rows.push(["LD Commission", values.ldCommissions]);
    rows.push(
      ["Net Report", values.netReport],
      ["Expected Cash", values.expectedCash],
      ["Actual Ending Cash", Number(form.actualEndingCash || 0)],
      ["Variance", values.variance],
    );
    rows.forEach(([label, amount]) => {
      pdf.text(label, 20, y);
      pdf.text(formatCurrency(amount), 130, y);
      y += 8;
    });
    y += 8;
    pdf.text("Products Sold", 20, y);
    y += 8;
    productRows.forEach(([name, product]) => {
      pdf.text(`${name} x${product.quantity}`, 20, y);
      pdf.text(formatCurrency(product.amount), 130, y);
      y += 7;
    });
    const detailSections: Array<[string, string[]]> = [
      [
        "Expenses",
        expenseRows.map(
          (entry) =>
            `${entry.category} · ${entry.description} · ${entry.payee}: ${formatCurrency(entry.amount)}`,
        ),
      ],
      [
        "Allowances",
        allowanceRows.map(
          (entry) =>
            `${entry.employee} · ${entry.reason}: ${formatCurrency(entry.amount)}`,
        ),
      ],
      [
        "Commission",
        commissionRows.map(
          (entry) =>
            `${entry.employee} · ${entry.category || entry.salesReference}: ${formatCurrency(entry.amount)}`,
        ),
      ],
      [
        "LD Commission",
        ldCommissionRows.map(
          (entry) =>
            `${entry.employee} · ${entry.category || entry.reference}: ${formatCurrency(entry.amount)}`,
        ),
      ],
    ];
    detailSections.forEach(([heading, entries]) => {
      if (!entries.length) return;
      y += 5;
      pdf.text(heading, 20, y);
      y += 7;
      entries.forEach((entry) => {
        const wrapped = pdf.splitTextToSize(entry, 170);
        pdf.text(wrapped, 20, y);
        y += wrapped.length * 6;
      });
    });
    y += 5;
    pdf.text(`Notes: ${form.notes || "None"}`, 20, y);
    pdf.save(`end-of-day-${values.date}.pdf`);
    onClose();
  };

  return (
    <>
      <div className="panel">
        <div className="panel-header">
          <h3>End of Day Report · {date}</h3>
        </div>
        <ReportSummary
          values={values}
          includeCommissions={includeCommissions}
          includeLdCommissions={includeLdCommissions}
        />
        <h4>Products Sold</h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity Sold</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {productRows.length === 0 ? (
              <tr>
                <td colSpan={3}>No products sold.</td>
              </tr>
            ) : (
              productRows.map(([name, product]) => (
                <tr key={name}>
                  <td>{name}</td>
                  <td>{product.quantity}</td>
                  <td>{formatCurrency(product.amount)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <EodDetailTables
          expenses={expenseRows}
          allowances={allowanceRows}
          commissions={commissionRows}
          ldCommissions={ldCommissionRows}
          includeCommissions={includeCommissions}
          includeLdCommissions={includeLdCommissions}
        />
        <div className="form-grid">
          <div className="field-group">
            <label>Actual Ending Cash</label>
            <input
              type="number"
              value={form.actualEndingCash}
              onChange={(event) =>
                setForm({ ...form, actualEndingCash: event.target.value })
              }
            />
          </div>
          <div className="field-group">
            <label>Variance</label>
            <input value={formatCurrency(variance)} readOnly />
          </div>
          <div className="field-group span-2">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={(event) =>
                setForm({ ...form, notes: event.target.value })
              }
            />
          </div>
          <div className="full-row">
            <button
              type="button"
              className="primary-button"
              onClick={() => setReviewOpen(true)}
            >
              End of Shift
            </button>
          </div>
        </div>
      </div>
      {reviewOpen && (
        <div className="modal-backdrop" onClick={() => setReviewOpen(false)}>
          <div
            className="modal-panel eod-review-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="panel-header">
              <h3>Review End of Day Report</h3>
              <button
                type="button"
                className="icon-button"
                onClick={() => setReviewOpen(false)}
              >
                ✕
              </button>
            </div>
            <p className="section-caption">
              Review this report before closing the register. Proceed will
              download a PDF and close the shift.
            </p>
            <ReportSummary
              values={values}
              includeCommissions={includeCommissions}
              includeLdCommissions={includeLdCommissions}
            />
            <h4>Products Sold</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {productRows.map(([name, product]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(product.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <EodDetailTables
              expenses={expenseRows}
              allowances={allowanceRows}
              commissions={commissionRows}
              ldCommissions={ldCommissionRows}
              includeCommissions={includeCommissions}
              includeLdCommissions={includeLdCommissions}
            />
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setReviewOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="primary-button"
                onClick={exportPdfAndClose}
              >
                Proceed & Export PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function EodDetailTables({
  expenses,
  allowances,
  commissions,
  ldCommissions,
  includeCommissions,
  includeLdCommissions,
}: {
  expenses: Props["expenses"];
  allowances: Props["allowances"];
  commissions: Props["commissions"];
  ldCommissions: Props["ldCommissions"];
  includeCommissions: boolean;
  includeLdCommissions: boolean;
}) {
  return (
    <div className="eod-detail-tables">
      <h4>Expenses</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Description</th>
            <th>Payee</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length ? (
            expenses.map((entry) => (
              <tr key={entry.date + entry.description}>
                <td>{entry.category}</td>
                <td>{entry.description}</td>
                <td>{entry.payee}</td>
                <td>{formatCurrency(entry.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>No expenses.</td>
            </tr>
          )}
        </tbody>
      </table>
      <h4>Allowances</h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Reason</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {allowances.length ? (
            allowances.map((entry) => (
              <tr key={entry.date + entry.employee + entry.reason}>
                <td>{entry.employee}</td>
                <td>{entry.reason}</td>
                <td>{formatCurrency(entry.amount)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3}>No allowances.</td>
            </tr>
          )}
        </tbody>
      </table>
      {includeCommissions && (
        <>
          <h4>Commission</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {commissions.length ? (
                commissions.map((entry) => (
                  <tr key={entry.date + entry.employee + entry.salesReference}>
                    <td>{entry.employee}</td>
                    <td>{entry.category || entry.salesReference}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No commissions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
      {includeLdCommissions && (
        <>
          <h4>LD Commission</h4>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {ldCommissions.length ? (
                ldCommissions.map((entry) => (
                  <tr key={entry.date + entry.employee + entry.reference}>
                    <td>{entry.employee}</td>
                    <td>{entry.category || entry.reference}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3}>No LD commissions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
