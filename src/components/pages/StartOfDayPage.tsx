import type { FormState } from "../../types";
type Props = {
  openShift: { cashierName: string; registerNumber: string } | null;
  form: FormState;
  setForm: (value: FormState) => void;
  onSubmit: () => void;
};
export function StartOfDayPage({ openShift, form, setForm, onSubmit }: Props) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Start of Day</h3>
      </div>
      {openShift ? (
        <div className="status-box success-box">
          <p className="status-badge open">REGISTER OPEN</p>
          <p>
            {openShift.cashierName} is already assigned to{" "}
            {openShift.registerNumber}.
          </p>
        </div>
      ) : (
        <div className="form-grid">
          <div className="field-group">
            <label>Business Date</label>
            <input
              type="date"
              value={form.businessDate}
              onChange={(event) =>
                setForm({ ...form, businessDate: event.target.value })
              }
            />
          </div>
          <div className="field-group">
            <label>Opening Cash / Fund</label>
            <input
              type="number"
              value={form.openingCash}
              onChange={(event) =>
                setForm({ ...form, openingCash: event.target.value })
              }
            />
          </div>
          <div className="field-group">
            <label>Register Number</label>
            <input
              value={form.registerNumber}
              onChange={(event) =>
                setForm({ ...form, registerNumber: event.target.value })
              }
            />
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
            <button type="button" className="primary-button" onClick={onSubmit}>
              Confirm Start of Day
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
