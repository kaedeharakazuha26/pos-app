import type { Dispatch, SetStateAction } from "react";
import type {
  AllowanceFormState,
  CommissionFormState,
  EmployeeFormState,
  ExpenseFormState,
  LdCommissionFormState,
  ProductFormState,
  RecordEditorKind,
  Role,
  Status,
} from "../types";

type Props = {
  visible: boolean;
  kind: RecordEditorKind;
  onClose: () => void;
  productForm: ProductFormState;
  setProductForm: Dispatch<SetStateAction<ProductFormState>>;
  employeeForm: EmployeeFormState;
  setEmployeeForm: Dispatch<SetStateAction<EmployeeFormState>>;
  expenseForm: ExpenseFormState;
  setExpenseForm: Dispatch<SetStateAction<ExpenseFormState>>;
  allowanceForm: AllowanceFormState;
  setAllowanceForm: Dispatch<SetStateAction<AllowanceFormState>>;
  commissionForm: CommissionFormState;
  setCommissionForm: Dispatch<SetStateAction<CommissionFormState>>;
  ldCommissionForm: LdCommissionFormState;
  setLdCommissionForm: Dispatch<SetStateAction<LdCommissionFormState>>;
  handleCreateProduct: () => void;
  handleCreateEmployee: () => void;
  handleCreateExpense: () => void;
  handleCreateAllowance: () => void;
  handleCreateCommission: () => void;
  handleCreateLdCommission: () => void;
  expenseCategories: string[];
  commissionCategories: string[];
  ldCommissionCategories: string[];
  onAddCategory: (kind: "expense" | "commission" | "ldCommission") => void;
};

export function RecordEditorModal({
  visible,
  kind,
  onClose,
  productForm,
  setProductForm,
  employeeForm,
  setEmployeeForm,
  expenseForm,
  setExpenseForm,
  allowanceForm,
  setAllowanceForm,
  commissionForm,
  setCommissionForm,
  ldCommissionForm,
  setLdCommissionForm,
  handleCreateProduct,
  handleCreateEmployee,
  handleCreateExpense,
  handleCreateAllowance,
  handleCreateCommission,
  handleCreateLdCommission,
  expenseCategories,
  commissionCategories,
  ldCommissionCategories,
  onAddCategory,
}: Props) {
  if (!visible) {
    return null;
  }

  const title =
    kind === "product"
      ? "Add Product"
      : kind === "employee"
        ? "Add Employee"
        : kind === "expense"
          ? "Add Expense"
          : kind === "allowance"
            ? "Add Allowance"
            : kind === "commission"
              ? "Add Commission"
              : "Add LD Commission";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h3>{title}</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {kind === "product" && (
          <div className="form-grid">
            <div className="field-group">
              <label>SKU</label>
              <input
                value={productForm.sku}
                onChange={(event) =>
                  setProductForm({ ...productForm, sku: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Name</label>
              <input
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({ ...productForm, name: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Category</label>
              <input
                value={productForm.category}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    category: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Selling Price</label>
              <input
                type="number"
                value={productForm.sellingPrice}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    sellingPrice: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Cost Price</label>
              <input
                type="number"
                value={productForm.costPrice}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    costPrice: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Stock</label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(event) =>
                  setProductForm({ ...productForm, stock: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Status</label>
              <select
                value={productForm.status}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    status: event.target.value as Status,
                  })
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div className="field-group span-2">
              <label>Variants (maximum 20)</label>
              {productForm.variants.map((variant, index) => (
                <div key={variant.id} className="variant-editor-row">
                  <input
                    placeholder={`Variant ${index + 1} name`}
                    value={variant.name}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        variants: productForm.variants.map((entry) =>
                          entry.id === variant.id
                            ? { ...entry, name: event.target.value }
                            : entry,
                        ),
                      })
                    }
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={variant.sellingPrice}
                    onChange={(event) =>
                      setProductForm({
                        ...productForm,
                        variants: productForm.variants.map((entry) =>
                          entry.id === variant.id
                            ? { ...entry, sellingPrice: event.target.value }
                            : entry,
                        ),
                      })
                    }
                  />
                  <button
                    type="button"
                    className="link-button danger-link"
                    onClick={() =>
                      setProductForm({
                        ...productForm,
                        variants: productForm.variants.filter(
                          (entry) => entry.id !== variant.id,
                        ),
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              ))}
              {productForm.variants.length < 20 && (
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    setProductForm({
                      ...productForm,
                      variants: [
                        ...productForm.variants,
                        {
                          id: `variant-${Date.now()}`,
                          name: "",
                          sellingPrice: productForm.sellingPrice,
                        },
                      ],
                    })
                  }
                >
                  Add Variant
                </button>
              )}
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateProduct}
              >
                Save Product
              </button>
            </div>
          </div>
        )}

        {kind === "employee" && (
          <div className="form-grid">
            <div className="field-group">
              <label>Employee ID</label>
              <input
                value={employeeForm.employeeId}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    employeeId: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Full Name</label>
              <input
                value={employeeForm.fullName}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    fullName: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Username</label>
              <input
                value={employeeForm.username}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    username: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Login PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={employeeForm.pin}
                onChange={(event) =>
                  setEmployeeForm({ ...employeeForm, pin: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Role</label>
              <select
                value={employeeForm.role}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    role: event.target.value as Role,
                  })
                }
              >
                <option value="Administrator">Administrator</option>
                <option value="Cashier">Cashier</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
            <div className="field-group">
              <label>Contact</label>
              <input
                value={employeeForm.contact}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    contact: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Status</label>
              <select
                value={employeeForm.status}
                onChange={(event) =>
                  setEmployeeForm({
                    ...employeeForm,
                    status: event.target.value as Status,
                  })
                }
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateEmployee}
              >
                Save Employee
              </button>
            </div>
          </div>
        )}

        {kind === "expense" && (
          <div className="form-grid">
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                value={expenseForm.date}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, date: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Category</label>
              <div className="select-with-action">
                <select
                  value={expenseForm.category}
                  onChange={(event) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: event.target.value,
                    })
                  }
                >
                  {expenseCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onAddCategory("expense")}
                  title="Add expense category"
                >
                  +
                </button>
              </div>
            </div>
            <div className="field-group span-2">
              <label>Description</label>
              <input
                value={expenseForm.description}
                onChange={(event) =>
                  setExpenseForm({
                    ...expenseForm,
                    description: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Amount</label>
              <input
                type="number"
                value={expenseForm.amount}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, amount: event.target.value })
                }
              />
            </div>
            <div className="field-group">
              <label>Payee</label>
              <input
                value={expenseForm.payee}
                onChange={(event) =>
                  setExpenseForm({ ...expenseForm, payee: event.target.value })
                }
              />
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateExpense}
              >
                Save Expense
              </button>
            </div>
          </div>
        )}

        {kind === "allowance" && (
          <div className="form-grid">
            <div className="field-group">
              <label>Employee</label>
              <input
                value={allowanceForm.employee}
                onChange={(event) =>
                  setAllowanceForm({
                    ...allowanceForm,
                    employee: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                value={allowanceForm.date}
                onChange={(event) =>
                  setAllowanceForm({
                    ...allowanceForm,
                    date: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Amount</label>
              <input
                type="number"
                value={allowanceForm.amount}
                onChange={(event) =>
                  setAllowanceForm({
                    ...allowanceForm,
                    amount: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group span-2">
              <label>Reason</label>
              <input
                value={allowanceForm.reason}
                onChange={(event) =>
                  setAllowanceForm({
                    ...allowanceForm,
                    reason: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group span-2">
              <label>Notes</label>
              <textarea
                value={allowanceForm.notes}
                onChange={(event) =>
                  setAllowanceForm({
                    ...allowanceForm,
                    notes: event.target.value,
                  })
                }
              />
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateAllowance}
              >
                Save Allowance
              </button>
            </div>
          </div>
        )}

        {kind === "commission" && (
          <div className="form-grid">
            <div className="field-group">
              <label>Employee</label>
              <input
                value={commissionForm.employee}
                onChange={(event) =>
                  setCommissionForm({
                    ...commissionForm,
                    employee: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                value={commissionForm.date}
                onChange={(event) =>
                  setCommissionForm({
                    ...commissionForm,
                    date: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Category</label>
              <div className="select-with-action">
                <select
                  value={commissionForm.category}
                  onChange={(event) =>
                    setCommissionForm({
                      ...commissionForm,
                      category: event.target.value,
                    })
                  }
                >
                  {commissionCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onAddCategory("commission")}
                  title="Add commission category"
                >
                  +
                </button>
              </div>
            </div>
            <div className="field-group">
              <label>Rate</label>
              <input
                type="number"
                step="0.01"
                value={commissionForm.rate}
                onChange={(event) =>
                  setCommissionForm({
                    ...commissionForm,
                    rate: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Amount</label>
              <input
                type="number"
                value={commissionForm.amount}
                onChange={(event) =>
                  setCommissionForm({
                    ...commissionForm,
                    amount: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group span-2">
              <label>Notes</label>
              <textarea
                value={commissionForm.notes}
                onChange={(event) =>
                  setCommissionForm({
                    ...commissionForm,
                    notes: event.target.value,
                  })
                }
              />
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateCommission}
              >
                Save Commission
              </button>
            </div>
          </div>
        )}

        {kind === "ldCommission" && (
          <div className="form-grid">
            <div className="field-group">
              <label>Employee</label>
              <input
                value={ldCommissionForm.employee}
                onChange={(event) =>
                  setLdCommissionForm({
                    ...ldCommissionForm,
                    employee: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Date</label>
              <input
                type="date"
                value={ldCommissionForm.date}
                onChange={(event) =>
                  setLdCommissionForm({
                    ...ldCommissionForm,
                    date: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group">
              <label>Category</label>
              <div className="select-with-action">
                <select
                  value={ldCommissionForm.category}
                  onChange={(event) =>
                    setLdCommissionForm({
                      ...ldCommissionForm,
                      category: event.target.value,
                    })
                  }
                >
                  {ldCommissionCategories.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => onAddCategory("ldCommission")}
                  title="Add LD commission category"
                >
                  +
                </button>
              </div>
            </div>
            <div className="field-group">
              <label>Amount</label>
              <input
                type="number"
                value={ldCommissionForm.amount}
                onChange={(event) =>
                  setLdCommissionForm({
                    ...ldCommissionForm,
                    amount: event.target.value,
                  })
                }
              />
            </div>
            <div className="field-group span-2">
              <label>Notes</label>
              <textarea
                value={ldCommissionForm.notes}
                onChange={(event) =>
                  setLdCommissionForm({
                    ...ldCommissionForm,
                    notes: event.target.value,
                  })
                }
              />
            </div>
            <div className="full-row">
              <button
                type="button"
                className="primary-button"
                onClick={handleCreateLdCommission}
              >
                Save LD Commission
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
