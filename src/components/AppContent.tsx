import { useState, type Dispatch, type SetStateAction } from 'react'
import { RecordEditorModal } from './RecordEditorModal'
import { StatCard } from './StatCard'
import { Sidebar } from './Sidebar'
import { TopBar as ExtractedTopBar } from './TopBar'
import { AllowancesPage } from './pages/AllowancesPage'
import { CommissionsPage } from './pages/CommissionsPage'
import { EmployeesPage } from './pages/EmployeesPage'
import { ExpensesPage } from './pages/ExpensesPage'
import { LdCommissionsPage } from './pages/LdCommissionsPage'
import { ProductsPage } from './pages/ProductsPage'
import { DashboardPage } from './pages/DashboardPage'
import { EndOfShiftPage } from './pages/EndOfShiftPage'
import { PosRegisterPage } from './pages/PosRegisterPage'
import { SalesHistoryPage } from './pages/SalesHistoryPage'
import { StartOfDayPage } from './pages/StartOfDayPage'
import { InventoryPage } from './pages/InventoryPage'
import { ReportsPage, type ReportMenu, type ReportPeriod, type ReportRow } from './pages/ReportsPage'
import {
  formatCurrency,
  getAllowedPages,
  getBusinessDate,
  getPageTitle,
  navItems,
} from '../pos-utils'
import type {
  AllowanceFormState,
  AppData,
  CartItem,
  CommissionFormState,
  EmployeeFormState,
  ExpenseFormState,
  FormState,
  LdCommissionFormState,
  PageId,
  PaymentMethod,
  PrinterConnection,
  Product,
  ProductFormState,
  RecordEditorKind,
  Role,
  Sale,
  ToastState,
} from '../types'

type BluetoothDeviceLike = {
  id: string
  name?: string
}

type UsbDeviceLike = {
  vendorId: number
  productId: number
  productName?: string
  manufacturerName?: string
  serialNumber?: string
}

type PrinterNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: { acceptAllDevices: boolean }) => Promise<BluetoothDeviceLike>
  }
  usb?: {
    requestDevice: (options: { filters: never[] }) => Promise<UsbDeviceLike>
  }
}

type LoginScreenProps = {
  appData: AppData
  selectedUserId: string
  setSelectedUserId: (value: string) => void
  pinInput: string
  setPinInput: (value: string) => void
  onLogin: () => void
}

export function LoginScreen({ appData, selectedUserId, setSelectedUserId, pinInput, setPinInput, onLogin }: LoginScreenProps) {
  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="brand-panel">
          <div className="brand-mark">J</div>
          <div>
            <p className="eyebrow">Premium retail system</p>
            <h1>Joyce POS</h1>
          </div>
        </div>

        <div className="login-form">
          <div className="field-group">
            <label>User</label>
            <select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>
              {appData.users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>PIN</label>
            <input
              type="password"
              value={pinInput}
              onChange={(event) => setPinInput(event.target.value)}
              placeholder="Enter PIN"
            />
          </div>

          <button type="button" className="primary-button wide" onClick={onLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

type SidebarProps = {
  currentUser: { id: string; name: string; role: Role } | null
  activePage: PageId
  setActivePage: (page: PageId) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
}

export function AppSidebar({ currentUser, activePage, setActivePage, sidebarCollapsed, onLogout }: SidebarProps) {
  if (!currentUser) {
    return null
  }

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="brand-area">
        <div className="brand-mark">J</div>
        {!sidebarCollapsed && <div><strong>Joyce POS</strong></div>}
      </div>

      <nav>
        {navItems.map((item) => {
          const isAllowed = getAllowedPages(currentUser.role).includes(item.id)
          if (!isAllowed) {
            return null
          }

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-button ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
              title={item.label}
            >
              <span>{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="nav-button danger" onClick={onLogout}>
          <span>↩</span>
          {!sidebarCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  )
}

type TopBarProps = {
  currentUser: { id: string; name: string; role: Role } | null
  activePage: PageId
  currentTime: Date
  theme: string
  onToggleSidebar: () => void
  onToggleTheme: () => void
}

export function TopBar({ currentUser, activePage, currentTime, theme, onToggleSidebar, onToggleTheme }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-button" onClick={onToggleSidebar}>
          ☰
        </button>
        <div>
          <p className="eyebrow">{getPageTitle(activePage)}</p>
          <h2>{new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(currentTime)}</h2>
        </div>
      </div>

      <div className="topbar-right">
        <span className="clock-pill">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
        <button type="button" className="icon-button" onClick={onToggleTheme}>
          {theme === 'dark' ? '☀' : '☾'}
        </button>
        <div className="user-chip">
          <strong>{currentUser?.name}</strong>
          <span>{currentUser?.role}</span>
        </div>
      </div>
    </header>
  )
}

type PaymentModalProps = {
  open: boolean
  paymentTotal: number
  paymentDraft: { method: PaymentMethod; amountReceived: string; notes: string }
  setPaymentDraft: (value: { method: PaymentMethod; amountReceived: string; notes: string }) => void
  paymentMethods: PaymentMethod[]
  calculatedChange: number
  onClose: () => void
  onConfirm: () => void
}

export function PaymentModal({
  open,
  paymentTotal,
  paymentDraft,
  setPaymentDraft,
  paymentMethods,
  calculatedChange,
  onClose,
  onConfirm,
}: PaymentModalProps) {
  if (!open) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h3>Payment</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="payment-summary">
          <div>
            <span>Total</span>
            <strong>{formatCurrency(paymentTotal)}</strong>
          </div>
        </div>

        <div className="form-grid">
          <div className="field-group">
            <label>Payment method</label>
            <select
              value={paymentDraft.method}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, method: event.target.value as PaymentMethod })}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Amount received</label>
            <input
              type="number"
              value={paymentDraft.amountReceived}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, amountReceived: event.target.value })}
            />
          </div>

          <div className="field-group span-2">
            <label>Notes</label>
            <textarea
              value={paymentDraft.notes}
              onChange={(event) => setPaymentDraft({ ...paymentDraft, notes: event.target.value })}
            />
          </div>
        </div>

        <div className="change-box">
          <span>Change</span>
          <strong>{formatCurrency(calculatedChange)}</strong>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="primary-button" onClick={onConfirm}>
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  )
}

type ReceiptModalProps = {
  sale: Sale | null
  appData: AppData
  onClose: () => void
  onDirectPrint: () => void
}

export function ReceiptModal({ sale, appData, onClose, onDirectPrint }: ReceiptModalProps) {
  if (!sale) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="receipt-panel" onClick={(event) => event.stopPropagation()}>
        <div className="panel-header">
          <h3>Receipt Preview</h3>
          <button type="button" className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="receipt-content">
          <h4>{appData.settings.businessName}</h4>
          <p>{appData.settings.address}</p>
          <p>{appData.settings.phone}</p>
          <hr />
          <p><strong>Receipt:</strong> {sale.transactionNumber}</p>
          <p>{sale.saleDate} • {sale.saleTime}</p>
          <p>Cashier: {sale.cashierName}</p>
          <hr />
          {sale.items.map((item) => (
            <div key={item.id} className="receipt-line">
              <span>{item.productName} x{item.quantity}</span>
              <span>{formatCurrency(item.lineTotal)}</span>
            </div>
          ))}
          <hr />
          <div className="receipt-line"><span>Subtotal</span><span>{formatCurrency(sale.subtotal)}</span></div>
          <div className="receipt-line"><span>Discount</span><span>{formatCurrency(sale.discount)}</span></div>
          <div className="receipt-line total"><span>Total</span><span>{formatCurrency(sale.total)}</span></div>
          <div className="receipt-line"><span>Method</span><span>{sale.paymentMethod}</span></div>
          <div className="receipt-line"><span>Received</span><span>{formatCurrency(sale.amountReceived)}</span></div>
          <div className="receipt-line"><span>Change</span><span>{formatCurrency(sale.change)}</span></div>
          <hr />
          <p>{appData.settings.receiptFooter}</p>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
          <button type="button" className="secondary-button" onClick={() => window.print()}>
            System Print
          </button>
          <button type="button" className="primary-button" onClick={onDirectPrint}>
            Direct Print
          </button>
        </div>
      </div>
    </div>
  )
}

type ToastProps = {
  toast: ToastState | null
}

export function AppToast({ toast }: ToastProps) {
  if (!toast) return null
  return <div className={`toast toast-${toast.tone}`}>{toast.text}</div>
}


type PageContentProps = {
  currentUser: { id: string; name: string; role: Role } | null
  appData: AppData
  activePage: PageId
  setActivePage: (page: PageId) => void
  selectedUserId: string
  setSelectedUserId: (value: string) => void
  pinInput: string
  setPinInput: (value: string) => void
  onLogin: () => void
  registerLocked: boolean
  setToast: (toast: ToastState | null) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  onLogout: () => void
  onExportData: () => void
  onImportData: (file: File) => void
  onHandleStartDay: () => void
  onRestock: (productId: string, quantity: number) => void
  onDeleteProduct: (productId: string) => void
  onDeleteEmployee: (employeeId: string) => void
  onResetSales: () => void
  onDeleteReport: (menu: ReportMenu, id: string) => void
  onAddCategory: (kind: 'expense' | 'commission' | 'ldCommission') => void
  shiftForm: FormState
  setShiftForm: (value: FormState) => void
  openShift: { id: string; businessDate: string; registerNumber: string; cashierName: string; openingCash: number } | null
  onHandleCloseShift: () => void
  closeShiftForm: { actualEndingCash: string; notes: string }
  setCloseShiftForm: (value: { actualEndingCash: string; notes: string }) => void
  onSetPaymentModalOpen: (value: boolean) => void
  paymentModalOpen: boolean
  paymentDraft: { method: PaymentMethod; amountReceived: string; notes: string }
  setPaymentDraft: (value: { method: PaymentMethod; amountReceived: string; notes: string }) => void
  paymentTotal: number
  calculatedChange: number
  cart: CartItem[]
  setCart: (next: CartItem[] | ((prev: CartItem[]) => CartItem[])) => void
  searchTerm: string
  setSearchTerm: (value: string) => void
  selectedCategory: string
  setSelectedCategory: (value: string) => void
  productsByCategory: string[]
  filteredProducts: Product[]
  addItemToCart: (product: Product) => void
  updateCartQuantity: (productId: string, direction: number) => void
  salesSearchTerm: string
  setSalesSearchTerm: (value: string) => void
  filteredSales: Sale[]
  setReceiptSale: (sale: Sale | null) => void
  recordEditor: {
    kind: RecordEditorKind
    data: Record<string, string>
  } | null
  openRecordEditor: (kind: RecordEditorKind) => void
  resetRecordEditor: () => void
  productForm: ProductFormState
  setProductForm: Dispatch<SetStateAction<ProductFormState>>
  employeeForm: EmployeeFormState
  setEmployeeForm: Dispatch<SetStateAction<EmployeeFormState>>
  expenseForm: ExpenseFormState
  setExpenseForm: Dispatch<SetStateAction<ExpenseFormState>>
  allowanceForm: AllowanceFormState
  setAllowanceForm: Dispatch<SetStateAction<AllowanceFormState>>
  commissionForm: CommissionFormState
  setCommissionForm: Dispatch<SetStateAction<CommissionFormState>>
  ldCommissionForm: LdCommissionFormState
  setLdCommissionForm: Dispatch<SetStateAction<LdCommissionFormState>>
  handleCreateProduct: () => void
  handleCreateEmployee: () => void
  handleCreateExpense: () => void
  handleCreateAllowance: () => void
  handleCreateCommission: () => void
  handleCreateLdCommission: () => void
  currentTime: Date
  salesSummary: {
    grossSales: number
    cashSales: number
    cardSales: number
    eWalletSales: number
    expensesTotal: number
    allowancesTotal: number
    commissionTotal: number
    ldCommissionTotal: number
    netSales: number
    transactions: number
  }
  dailyTrend: { label: string; value: number }[]
  lowStockProducts: Product[]
  recentAuditLogs: Array<{ id: string; action: string; description: string }>
  setAppData: (value: AppData | ((prev: AppData) => AppData)) => void
  onToggleTheme: () => void
  onConfirmPayment: () => void
  onVoidSale: (saleId: string) => void
  receiptSale: Sale | null
  onDirectPrint: () => void
  onCloseReceipt: () => void
}

export function AppContent(props: PageContentProps) {
  const [salesPeriod, setSalesPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily')
  const [salesDate, setSalesDate] = useState(getBusinessDate())
  const [showVoidedSales, setShowVoidedSales] = useState(false)
  const [reportMenu, setReportMenu] = useState<ReportMenu>('sales')
  const [reportPeriod, setReportPeriod] = useState<ReportPeriod>('daily')
  const [reportDate, setReportDate] = useState(getBusinessDate())
  const [recordDate, setRecordDate] = useState('all')
  const {
    currentUser,
    appData,
    activePage,
    setActivePage,
    onLogin,
    selectedUserId,
    setSelectedUserId,
    pinInput,
    setPinInput,
    registerLocked,
    onHandleStartDay,
    onRestock,
    onDeleteProduct,
    onDeleteEmployee,
    onResetSales,
    onDeleteReport,
    onAddCategory,
    shiftForm,
    setShiftForm,
    openShift,
    onHandleCloseShift,
    closeShiftForm,
    setCloseShiftForm,
    onSetPaymentModalOpen,
    paymentModalOpen,
    paymentDraft,
    setPaymentDraft,
    paymentTotal,
    calculatedChange,
    cart,
    setCart,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    productsByCategory,
    filteredProducts,
    addItemToCart,
    updateCartQuantity,
    salesSearchTerm,
    setSalesSearchTerm,
    filteredSales,
    setReceiptSale,
    recordEditor,
    openRecordEditor,
    resetRecordEditor,
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
    currentTime,
    salesSummary,
    dailyTrend,
    lowStockProducts,
    recentAuditLogs,
    setAppData,
    onToggleTheme,
    onConfirmPayment,
    onVoidSale,
    receiptSale,
    onDirectPrint,
    onCloseReceipt,
    sidebarCollapsed,
    onToggleSidebar,
    onLogout,
  } = props

  const allowedPages = currentUser ? getAllowedPages(currentUser.role, appData.settings.rolePageAccess) : []

  if (!currentUser) {
    return (
      <LoginScreen
        appData={appData}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
        pinInput={pinInput}
        setPinInput={setPinInput}
        onLogin={onLogin}
      />
    )
  }

  if (!allowedPages.includes(activePage)) {
    return (
      <div className="empty-state-box">
        <h3>Access Restricted</h3>
        <p>This function is not available for your role.</p>
      </div>
    )
  }

  const selectedSalesDate = new Date(`${salesDate}T00:00:00`)
  const periodStart = new Date(selectedSalesDate)
  const periodEnd = new Date(selectedSalesDate)
  if (salesPeriod === 'weekly') {
    periodStart.setDate(periodStart.getDate() - periodStart.getDay())
    periodEnd.setDate(periodStart.getDate() + 6)
  } else if (salesPeriod === 'monthly') {
    periodStart.setDate(1)
    periodEnd.setMonth(periodStart.getMonth() + 1, 0)
  } else if (salesPeriod === 'yearly') {
    periodStart.setMonth(0, 1)
    periodEnd.setMonth(11, 31)
  }
  const periodStartKey = periodStart.toISOString().slice(0, 10)
  const periodEndKey = periodEnd.toISOString().slice(0, 10)
  const periodSales = filteredSales.filter((sale) => {
    const saleDateKey = sale.saleDate.slice(0, 10)
    return saleDateKey >= periodStartKey && saleDateKey <= periodEndKey && (showVoidedSales ? sale.status === 'void' : sale.status !== 'void')
  })
  const matchesRecordDate = (date: string) => recordDate === 'all' || date === recordDate
  const reportDateValue = new Date(`${reportDate}T00:00:00`)
  const reportStart = new Date(reportDateValue)
  const reportEnd = new Date(reportDateValue)
  if (reportPeriod === 'weekly') { reportStart.setDate(reportStart.getDate() - reportStart.getDay()); reportEnd.setDate(reportStart.getDate() + 6) }
  if (reportPeriod === 'monthly') { reportStart.setDate(1); reportEnd.setMonth(reportStart.getMonth() + 1, 0) }
  if (reportPeriod === 'yearly') { reportStart.setMonth(0, 1); reportEnd.setMonth(11, 31) }
  const reportStartKey = reportStart.toISOString().slice(0, 10)
  const reportEndKey = reportEnd.toISOString().slice(0, 10)
  const inReportPeriod = (date: string) => { const key = date.slice(0, 10); return key >= reportStartKey && key <= reportEndKey }
  const reportRows: ReportRow[] = reportMenu === 'sales' || reportMenu === 'void'
    ? appData.sales.filter((sale) => inReportPeriod(sale.saleDate) && (reportMenu === 'void' ? sale.status === 'void' : sale.status !== 'void')).map((sale) => ({ id: sale.id, date: sale.saleDate.slice(0, 10), reference: sale.transactionNumber, description: `${sale.cashierName} · ${sale.paymentMethod}`, amount: sale.total, status: sale.status }))
    : reportMenu === 'expenses'
      ? appData.expenses.filter((entry) => inReportPeriod(entry.date)).map((entry) => ({ id: entry.id, date: entry.date, reference: entry.category, description: `${entry.description} · ${entry.payee}`, amount: entry.amount, status: entry.status }))
      : reportMenu === 'allowance'
        ? appData.allowances.filter((entry) => inReportPeriod(entry.date)).map((entry) => ({ id: entry.id, date: entry.date, reference: entry.employee, description: entry.reason, amount: entry.amount, status: entry.status }))
        : reportMenu === 'commission'
          ? appData.commissions.filter((entry) => inReportPeriod(entry.date)).map((entry) => ({ id: entry.id, date: entry.date, reference: entry.category || entry.salesReference, description: entry.employee, amount: entry.amount, status: entry.status }))
          : appData.ldCommissions.filter((entry) => inReportPeriod(entry.date)).map((entry) => ({ id: entry.id, date: entry.date, reference: entry.category || entry.reference, description: entry.employee, amount: entry.amount, status: entry.status }))

  const renderPage = () => {
    switch (activePage as string) {
      case 'dashboard':
        return <DashboardPage summary={salesSummary} trend={dailyTrend} registerLocked={registerLocked} cashier={openShift?.cashierName || ''} shiftDate={openShift?.businessDate || ''} register={openShift?.registerNumber || ''} lowStock={lowStockProducts} audit={recentAuditLogs} />
      case 'dashboard-legacy':
        return (
          <div className="page-grid">
            <div className="stats-grid">
              <StatCard label="Today's Sales" value={formatCurrency(salesSummary.grossSales)} subtext={`${salesSummary.transactions} transactions`} />
              <StatCard label="Cash Sales" value={formatCurrency(salesSummary.cashSales)} subtext="Cash collected" />
              <StatCard label="Card Sales" value={formatCurrency(salesSummary.cardSales)} subtext="Card payments" />
              <StatCard label="E-Wallet Sales" value={formatCurrency(salesSummary.eWalletSales)} subtext="Digital payments" />
              <StatCard label="Expenses" value={formatCurrency(salesSummary.expensesTotal)} subtext="Operating costs" />
              <StatCard label="Allowances" value={formatCurrency(salesSummary.allowancesTotal)} subtext="Staff support" />
              <StatCard label="Commissions" value={formatCurrency(salesSummary.commissionTotal)} subtext="Sales commission" />
              <StatCard label="LD Commission" value={formatCurrency(salesSummary.ldCommissionTotal)} subtext="Lead payouts" />
              <StatCard label="Net Sales" value={formatCurrency(salesSummary.netSales)} subtext="After discounts" accent />
            </div>

            <div className="dashboard-panels">
              <div className="panel">
                <div className="panel-header">
                  <h3>Sales Trend</h3>
                </div>
                <div className="sales-chart">
                  {dailyTrend.map((entry) => (
                    <div key={entry.label} className="chart-bar-group">
                      <div className="chart-bar" style={{ height: `${Math.max((entry.value / 200) * 100, 10)}%` }} />
                      <span>{entry.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Register Status</h3>
                </div>
                <div className="status-box">
                  <p className={`status-badge ${registerLocked ? 'locked' : 'open'}`}>
                    {registerLocked ? 'REGISTER LOCKED' : 'REGISTER OPEN'}
                  </p>
                  <ul>
                    <li>Current cashier: {openShift ? openShift.cashierName : '—'}</li>
                    <li>Current shift: {openShift ? openShift.businessDate : 'No active shift'}</li>
                    <li>Register: {openShift ? openShift.registerNumber : '—'}</li>
                  </ul>
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Low Stock Alerts</h3>
                </div>
                <div className="status-box">
                  {lowStockProducts.length === 0 ? (
                    <p>All active products are stocked adequately.</p>
                  ) : (
                    <ul>
                      {lowStockProducts.map((product) => (
                        <li key={product.id}>
                          {product.name} — {product.stock} left
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="panel">
                <div className="panel-header">
                  <h3>Recent Activity</h3>
                </div>
                <div className="status-box">
                  <ul>
                    {recentAuditLogs.map((entry) => (
                      <li key={entry.id}>
                        <strong>{entry.action}</strong> — {entry.description}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )
      case 'start-day':
        return <StartOfDayPage openShift={openShift} form={shiftForm} setForm={setShiftForm} onSubmit={onHandleStartDay} />
      case 'start-day-legacy':
        return (
          <div className="panel">
            <div className="panel-header">
              <h3>Start of Day</h3>
            </div>

            {openShift ? (
              <div className="status-box success-box">
                <p className="status-badge open">REGISTER OPEN</p>
                <p>{openShift.cashierName} is already assigned to {openShift.registerNumber}.</p>
              </div>
            ) : (
              <div className="form-grid">
                <div className="field-group">
                  <label>Business Date</label>
                  <input
                    type="date"
                    value={shiftForm.businessDate}
                    onChange={(event) => setShiftForm({ ...shiftForm, businessDate: event.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Opening Cash / Fund</label>
                  <input
                    type="number"
                    value={shiftForm.openingCash}
                    onChange={(event) => setShiftForm({ ...shiftForm, openingCash: event.target.value })}
                  />
                </div>
                <div className="field-group">
                  <label>Register Number</label>
                  <input
                    value={shiftForm.registerNumber}
                    onChange={(event) => setShiftForm({ ...shiftForm, registerNumber: event.target.value })}
                  />
                </div>
                <div className="field-group span-2">
                  <label>Notes</label>
                  <textarea
                    value={shiftForm.notes}
                    onChange={(event) => setShiftForm({ ...shiftForm, notes: event.target.value })}
                  />
                </div>
                <div className="full-row">
                  <button type="button" className="primary-button" onClick={onHandleStartDay}>
                    Confirm Start of Day
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      case 'pos':
        return <PosRegisterPage locked={registerLocked} products={filteredProducts} categories={productsByCategory} search={searchTerm} category={selectedCategory} setSearch={setSearchTerm} setCategory={setSelectedCategory} cart={cart} total={paymentTotal} add={addItemToCart} update={updateCartQuantity} clear={() => setCart([])} pay={() => onSetPaymentModalOpen(true)} />
      case 'pos-legacy':
        return (
          <div className="pos-layout">
            <div className="pos-product-panel panel">
              <div className="panel-header split-header">
                <h3>Products</h3>
                <div className="toolbar-inline">
                  <input
                    type="search"
                    placeholder="Search products"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                  <select value={selectedCategory} onChange={(event) => setSelectedCategory(event.target.value)}>
                    {productsByCategory.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <button type="button" key={product.id} className="product-card" onClick={() => addItemToCart(product)}>
                    <div className="product-card-top">
                      <span className="product-chip">{product.category}</span>
                      <span className="stock-pill">{product.stock} in stock</span>
                    </div>
                    <h4>{product.name}</h4>
                    <p>{product.sku}</p>
                    <strong>{formatCurrency(product.sellingPrice)}</strong>
                  </button>
                ))}
              </div>
            </div>

            <div className="pos-cart-panel panel">
              <div className="panel-header">
                <h3>Current Order</h3>
              </div>

              {registerLocked ? (
                <div className="empty-state-box">
                  <h3>REGISTER LOCKED</h3>
                  <p>Start of Day required before sales can be processed.</p>
                </div>
              ) : (
                <>
                  <div className="cart-items">
                    {cart.length === 0 ? (
                      <div className="empty-state-box">
                        <h3>Cart is empty</h3>
                        <p>Add a product to begin the sale.</p>
                      </div>
                    ) : (
                      cart.map((item) => (
                        <div key={item.productId} className="cart-row">
                          <div>
                            <strong>{item.productName}</strong>
                            <small>{formatCurrency(item.unitPrice)} each</small>
                          </div>
                          <div className="cart-counter">
                            <button type="button" onClick={() => updateCartQuantity(item.productId, -1)}>-</button>
                            <span>{item.quantity}</span>
                            <button type="button" onClick={() => updateCartQuantity(item.productId, 1)}>+</button>
                          </div>
                          <button type="button" className="link-button" onClick={() => setCart((current) => current.filter((entry) => entry.productId !== item.productId))}>
                            Remove
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="totals-box">
                    <div><span>Subtotal</span><strong>{formatCurrency(paymentTotal)}</strong></div>
                    <div><span>Discount</span><strong>{formatCurrency(0)}</strong></div>
                    <div className="grand-total"><span>Total</span><strong>{formatCurrency(paymentTotal)}</strong></div>
                  </div>

                  <div className="cart-actions">
                    <button type="button" className="secondary-button" onClick={() => setCart([])}>
                      Clear Cart
                    </button>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onSetPaymentModalOpen(true)}
                      disabled={cart.length === 0}
                    >
                      Pay {formatCurrency(paymentTotal)}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      case 'end-shift': {
        return <EndOfShiftPage openShift={openShift} sales={appData.sales} expenses={appData.expenses} allowances={appData.allowances} commissions={appData.commissions} ldCommissions={appData.ldCommissions} includeCommissions={appData.settings.rolePageAccess[currentUser.role]?.includes('commissions') || false} includeLdCommissions={appData.settings.rolePageAccess[currentUser.role]?.includes('ld-commissions') || false} form={closeShiftForm} setForm={setCloseShiftForm} onClose={onHandleCloseShift} />
      }
      case 'end-shift-legacy': {
        if (!openShift) {
          return (
            <div className="empty-state-box">
              <div>
                <h3>Register Closed</h3>
                <p>No active shift is available to close.</p>
              </div>
            </div>
          )
        }

        const salesForShift = appData.sales.filter((sale) => sale.saleDate === openShift.businessDate)
        const grossSales = salesForShift.reduce((sum, sale) => sum + sale.total, 0)
        const discounts = salesForShift.reduce((sum, sale) => sum + sale.discount, 0)
        const netSales = grossSales - discounts
        const cashSales = salesForShift.filter((sale) => sale.paymentMethod === 'cash').reduce((sum, sale) => sum + sale.total, 0)
        const cardSales = salesForShift.filter((sale) => sale.paymentMethod === 'card').reduce((sum, sale) => sum + sale.total, 0)
        const eWalletSales = salesForShift.filter((sale) => sale.paymentMethod === 'e-wallet').reduce((sum, sale) => sum + sale.total, 0)
        const cashExpenses = appData.expenses.filter((expense) => expense.date === openShift.businessDate).reduce((sum, expense) => sum + expense.amount, 0)
        const expectedCash = openShift.openingCash + cashSales - cashExpenses
        const variance = Number(closeShiftForm.actualEndingCash || 0) - expectedCash

        return (
          <div className="panel">
            <div className="panel-header">
              <h3>End of Shift</h3>
            </div>

            <div className="stats-grid">
              <StatCard label="Gross Sales" value={formatCurrency(grossSales)} subtext="Total sales" />
              <StatCard label="Discounts" value={formatCurrency(discounts)} subtext="Sales discounts" />
              <StatCard label="Net Sales" value={formatCurrency(netSales)} subtext="After discount" accent />
              <StatCard label="Cash Sales" value={formatCurrency(cashSales)} subtext="Cash collected" />
              <StatCard label="Card Sales" value={formatCurrency(cardSales)} subtext="Card payments" />
              <StatCard label="E-Wallet" value={formatCurrency(eWalletSales)} subtext="Wallet payments" />
            </div>

            <div className="form-grid" style={{ marginTop: '20px' }}>
              <div className="field-group">
                <label>Opening Cash</label>
                <input value={formatCurrency(openShift.openingCash)} readOnly />
              </div>
              <div className="field-group">
                <label>Expected Cash</label>
                <input value={formatCurrency(expectedCash)} readOnly />
              </div>
              <div className="field-group">
                <label>Actual Ending Cash</label>
                <input
                  type="number"
                  value={closeShiftForm.actualEndingCash}
                  onChange={(event) => setCloseShiftForm({ ...closeShiftForm, actualEndingCash: event.target.value })}
                />
              </div>
              <div className="field-group">
                <label>Variance</label>
                <input value={formatCurrency(variance)} readOnly />
              </div>
              <div className="field-group span-2">
                <label>Notes</label>
                <textarea
                  value={closeShiftForm.notes}
                  onChange={(event) => setCloseShiftForm({ ...closeShiftForm, notes: event.target.value })}
                />
              </div>
              <div className="full-row">
                <button type="button" className="primary-button" onClick={onHandleCloseShift}>
                  Confirm End of Shift
                </button>
              </div>
            </div>
          </div>
        )
      }
      case 'sales-history':
        return <SalesHistoryPage records={periodSales} period={salesPeriod} date={salesDate} search={salesSearchTerm} showVoids={showVoidedSales} onShowVoids={setShowVoidedSales} onPeriodChange={setSalesPeriod} onDateChange={setSalesDate} onSearchChange={setSalesSearchTerm} onReceipt={setReceiptSale} onVoidSale={onVoidSale} canVoid={['Administrator', 'Cashier'].includes(currentUser.role)} />
      case 'sales-history-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Sales History</h3>
              <div className="toolbar-inline">
                <select value={salesPeriod} onChange={(event) => setSalesPeriod(event.target.value as typeof salesPeriod)}>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <input type="date" value={salesDate} onChange={(event) => setSalesDate(event.target.value)} />
                <input
                  type="search"
                  placeholder="Search by transaction or cashier"
                  value={salesSearchTerm}
                  onChange={(event) => setSalesSearchTerm(event.target.value)}
                />
              </div>
            </div>
            <p className="section-caption">Showing {salesPeriod} sales for the selected date.</p>
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
                {periodSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.transactionNumber}</td>
                    <td>{sale.saleDate}</td>
                    <td>{sale.cashierName}</td>
                    <td>{formatCurrency(sale.total)}</td>
                    <td>{sale.paymentMethod}</td>
                    <td>{sale.status}</td>
                    <td>
                      <button type="button" className="link-button" onClick={() => setReceiptSale(sale)}>
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'products':
        return <ProductsPage records={appData.products.filter((product) => matchesRecordDate(product.createdAt.slice(0, 10)))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('product')} onDelete={onDeleteProduct} canDelete={currentUser.role === 'Administrator'} />
      case 'inventory':
        return <InventoryPage products={appData.products.filter((product) => product.status === 'active')} onRestock={onRestock} />
      case 'employees':
        return <EmployeesPage records={appData.employees.filter((employee) => matchesRecordDate(employee.createdAt.slice(0, 10)))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('employee')} onDelete={onDeleteEmployee} canDelete={currentUser.role === 'Administrator'} />
      case 'expenses':
        return <ExpensesPage records={appData.expenses.filter((expense) => matchesRecordDate(expense.date))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('expense')} />
      case 'allowances':
        return <AllowancesPage records={appData.allowances.filter((allowance) => matchesRecordDate(allowance.date))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('allowance')} />
      case 'commissions':
        return <CommissionsPage records={appData.commissions.filter((commission) => matchesRecordDate(commission.date))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('commission')} />
      case 'ld-commissions':
        return <LdCommissionsPage records={appData.ldCommissions.filter((entry) => matchesRecordDate(entry.date))} dateValue={recordDate} onDateChange={setRecordDate} onAdd={() => openRecordEditor('ldCommission')} />
      case 'products-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Products</h3>
              <div className="toolbar-inline">
                <select value={recordDate} onChange={(event) => setRecordDate(event.target.value)}>
                  <option value="all">All dates</option>
                  <option value={new Date().toISOString().slice(0, 10)}>Today</option>
                </select>
                <button type="button" className="primary-button" onClick={() => openRecordEditor('product')}>
                Add Product
                </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appData.products.filter((product) => matchesRecordDate(product.createdAt.slice(0, 10))).map((product) => (
                  <tr key={product.id}>
                    <td>{product.sku}</td>
                    <td>{product.name}</td>
                    <td>{product.category}</td>
                    <td>{formatCurrency(product.sellingPrice)}</td>
                    <td>{product.stock}</td>
                    <td>{product.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'employees-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Employees</h3>
              <div className="toolbar-inline">
                <select value={recordDate} onChange={(event) => setRecordDate(event.target.value)}>
                  <option value="all">All dates</option>
                  <option value={new Date().toISOString().slice(0, 10)}>Today</option>
                </select>
              <button type="button" className="primary-button" onClick={() => openRecordEditor('employee')}>
                Add Employee
              </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Contact</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {appData.employees.filter((employee) => matchesRecordDate(employee.createdAt.slice(0, 10))).map((employee) => (
                  <tr key={employee.id}>
                    <td>{employee.employeeId}</td>
                    <td>{employee.fullName}</td>
                    <td>{employee.role}</td>
                    <td>{employee.contact}</td>
                    <td>{employee.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'expenses-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Expenses</h3>
              <div className="toolbar-inline">
                <input type="date" value={recordDate === 'all' ? '' : recordDate} onChange={(event) => setRecordDate(event.target.value || 'all')} />
              <button type="button" className="primary-button" onClick={() => openRecordEditor('expense')}>
                Add Expense
              </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Payee</th>
                </tr>
              </thead>
              <tbody>
                {appData.expenses.filter((expense) => matchesRecordDate(expense.date)).map((expense) => (
                  <tr key={expense.id}>
                    <td>{expense.date}</td>
                    <td>{expense.category}</td>
                    <td>{expense.description}</td>
                    <td>{formatCurrency(expense.amount)}</td>
                    <td>{expense.payee}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'allowances-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Allowances</h3>
              <div className="toolbar-inline">
                <input type="date" value={recordDate === 'all' ? '' : recordDate} onChange={(event) => setRecordDate(event.target.value || 'all')} />
              <button type="button" className="primary-button" onClick={() => openRecordEditor('allowance')}>
                Add Allowance
              </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {appData.allowances.filter((allowance) => matchesRecordDate(allowance.date)).map((allowance) => (
                  <tr key={allowance.id}>
                    <td>{allowance.employee}</td>
                    <td>{allowance.date}</td>
                    <td>{formatCurrency(allowance.amount)}</td>
                    <td>{allowance.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'commissions-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Commissions</h3>
              <div className="toolbar-inline">
                <input type="date" value={recordDate === 'all' ? '' : recordDate} onChange={(event) => setRecordDate(event.target.value || 'all')} />
              <button type="button" className="primary-button" onClick={() => openRecordEditor('commission')}>
                Add Commission
              </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Rate</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {appData.commissions.filter((commission) => matchesRecordDate(commission.date)).map((commission) => (
                  <tr key={commission.id}>
                    <td>{commission.employee}</td>
                    <td>{commission.date}</td>
                    <td>{commission.salesReference}</td>
                    <td>{commission.rate * 100}%</td>
                    <td>{formatCurrency(commission.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'ld-commissions-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>LD Commission</h3>
              <div className="toolbar-inline">
                <input type="date" value={recordDate === 'all' ? '' : recordDate} onChange={(event) => setRecordDate(event.target.value || 'all')} />
              <button type="button" className="primary-button" onClick={() => openRecordEditor('ldCommission')}>
                Add LD Commission
              </button>
              </div>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Reference</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {appData.ldCommissions.filter((entry) => matchesRecordDate(entry.date)).map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.employee}</td>
                    <td>{entry.date}</td>
                    <td>{entry.reference}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'reports':
        return <ReportsPage rows={reportRows} menu={reportMenu} period={reportPeriod} date={reportDate} onMenuChange={setReportMenu} onPeriodChange={setReportPeriod} onDateChange={setReportDate} onPrint={() => window.print()} onDelete={(row) => onDeleteReport(reportMenu, row.id)} canDelete={currentUser.role === 'Administrator'} />
      case 'reports-legacy':
        return (
          <div className="panel">
            <div className="panel-header split-header">
              <h3>Reports</h3>
              <button type="button" className="secondary-button" onClick={() => window.print()}>
                Print
              </button>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Transaction #</th>
                  <th>Date</th>
                  <th>Cashier</th>
                  <th>Subtotal</th>
                  <th>Discount</th>
                  <th>Total</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {appData.sales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.transactionNumber}</td>
                    <td>{sale.saleDate}</td>
                    <td>{sale.cashierName}</td>
                    <td>{formatCurrency(sale.subtotal)}</td>
                    <td>{formatCurrency(sale.discount)}</td>
                    <td>{formatCurrency(sale.total)}</td>
                    <td>{sale.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      case 'settings':
        return (
          <div className="settings-grid">
            <div className="panel">
              <div className="panel-header">
                <h3>Business Settings</h3>
              </div>
              <div className="form-grid">
                <div className="field-group">
                  <label>Business Name</label>
                  <input
                    value={appData.settings.businessName}
                    onChange={(event) => setAppData({ ...appData, settings: { ...appData.settings, businessName: event.target.value } })}
                  />
                </div>
                <div className="field-group">
                  <label>Phone</label>
                  <input
                    value={appData.settings.phone}
                    onChange={(event) => setAppData({ ...appData, settings: { ...appData.settings, phone: event.target.value } })}
                  />
                </div>
                <div className="field-group">
                  <label>Currency</label>
                  <select value={appData.settings.currency} onChange={(event) => setAppData({ ...appData, settings: { ...appData.settings, currency: event.target.value } })}>
                    <option value="USD">USD ($)</option>
                    <option value="PHP">PHP</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                  </select>
                </div>
                <div className="field-group span-2">
                  <label>Address</label>
                  <input
                    value={appData.settings.address}
                    onChange={(event) => setAppData({ ...appData, settings: { ...appData.settings, address: event.target.value } })}
                  />
                </div>
                <div className="field-group span-2">
                  <label>Receipt Footer</label>
                  <input
                    value={appData.settings.receiptFooter}
                    onChange={(event) => setAppData({ ...appData, settings: { ...appData.settings, receiptFooter: event.target.value } })}
                  />
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Theme</h3>
              </div>
              <div className="toggle-stack">
                <button
                  type="button"
                  className={`toggle-button ${appData.settings.theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setAppData({ ...appData, settings: { ...appData.settings, theme: 'dark' } })}
                >
                  Dark Mode
                </button>
                <button
                  type="button"
                  className={`toggle-button ${appData.settings.theme === 'light' ? 'active' : ''}`}
                  onClick={() => setAppData({ ...appData, settings: { ...appData.settings, theme: 'light' } })}
                >
                  Light Mode
                </button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Thermal Printer</h3>
              </div>
              <div className="form-grid">
                <div className="field-group">
                  <label>Connection</label>
                  <select
                    value={appData.settings.printerConnection}
                    onChange={(event) => {
                      const printerConnection = event.target.value as PrinterConnection
                      setAppData({
                        ...appData,
                        settings: {
                          ...appData.settings,
                          printerConnection,
                          ...(printerConnection === 'none'
                            ? { printerName: '', printerId: '', usbVendorId: null, usbProductId: null }
                            : {}),
                        },
                      })
                    }}
                  >
                    <option value="none">Not configured</option>
                    <option value="bluetooth">Bluetooth printer</option>
                    <option value="usb">USB printer</option>
                  </select>
                </div>
                <div className="field-group">
                  <label>Paper Width</label>
                  <select
                    value={appData.settings.printerPaperWidth}
                    onChange={(event) => setAppData({
                      ...appData,
                      settings: { ...appData.settings, printerPaperWidth: event.target.value as '58mm' | '80mm' },
                    })}
                  >
                    <option value="58mm">58 mm</option>
                    <option value="80mm">80 mm</option>
                  </select>
                </div>
                {appData.settings.printerConnection !== 'none' && (
                  <>
                    <div className="field-group span-2">
                      <label>Selected Device</label>
                      <input value={appData.settings.printerName || 'No device selected'} readOnly />
                      <small>
                        {appData.settings.printerConnection === 'bluetooth' && appData.settings.printerId
                          ? `Bluetooth ID: ${appData.settings.printerId}`
                          : appData.settings.printerConnection === 'usb' && appData.settings.usbVendorId !== null
                            ? `USB ${appData.settings.usbVendorId}:${appData.settings.usbProductId}`
                            : 'Choose a device to save it for receipt printing.'}
                      </small>
                    </div>
                    <div className="full-row toolbar-inline">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={async () => {
                          const printerNavigator = navigator as PrinterNavigator
                          if (appData.settings.printerConnection === 'bluetooth') {
                            if (!printerNavigator.bluetooth) {
                              props.setToast({ text: 'Bluetooth discovery is unavailable in this runtime.', tone: 'error' })
                              return
                            }
                            try {
                              const device = await printerNavigator.bluetooth.requestDevice({ acceptAllDevices: true })
                              setAppData({
                                ...appData,
                                settings: {
                                  ...appData.settings,
                                  printerName: device.name || 'Bluetooth thermal printer',
                                  printerId: device.id,
                                },
                              })
                              props.setToast({ text: 'Bluetooth printer selected.', tone: 'success' })
                            } catch {
                              props.setToast({ text: 'Bluetooth printer selection was cancelled.', tone: 'info' })
                            }
                          } else {
                            if (!printerNavigator.usb) {
                              props.setToast({ text: 'USB discovery is unavailable in this runtime.', tone: 'error' })
                              return
                            }
                            try {
                              const device = await printerNavigator.usb.requestDevice({ filters: [] })
                              setAppData({
                                ...appData,
                                settings: {
                                  ...appData.settings,
                                  printerName: device.productName || device.manufacturerName || 'USB thermal printer',
                                  printerId: device.serialNumber || `${device.vendorId}:${device.productId}`,
                                  usbVendorId: device.vendorId,
                                  usbProductId: device.productId,
                                },
                              })
                              props.setToast({ text: 'USB printer selected.', tone: 'success' })
                            } catch {
                              props.setToast({ text: 'USB printer selection was cancelled.', tone: 'info' })
                            }
                          }
                        }}
                      >
                        Detect {appData.settings.printerConnection === 'bluetooth' ? 'Bluetooth' : 'USB'} Device
                      </button>
                      <span className="printer-note">Automatic printing is disabled. Use the receipt Print button.</span>
                    </div>
                  </>
                )}
                <div className="full-row">
                  <small>Device discovery requires a secure context and a user permission prompt. The selected device metadata is saved locally.</small>
                </div>
              </div>
            </div>

            <div className="panel span-2">
              <div className="panel-header">
                <h3>Role Menu Access</h3>
              </div>
              <p className="section-caption">Choose which sidebar menus each role can access. Hiding a menu also blocks direct access to that page.</p>
              <div className="access-grid">
                {(['Administrator', 'Cashier', 'Staff'] as Role[]).map((role) => (
                  <div key={role} className="access-column">
                    <strong>{role}</strong>
                    {navItems.map((item) => {
                      const checked = appData.settings.rolePageAccess[role]?.includes(item.id) || false
                      return (
                        <label key={item.id} className="checkbox-field">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={role === 'Administrator' && item.id === 'settings'}
                            onChange={(event) => {
                              const currentPages = appData.settings.rolePageAccess[role] || []
                              const nextPages = event.target.checked
                                ? [...new Set([...currentPages, item.id])]
                                : currentPages.filter((page) => page !== item.id)
                              setAppData({
                                ...appData,
                                settings: {
                                  ...appData.settings,
                                  rolePageAccess: { ...appData.settings.rolePageAccess, [role]: nextPages },
                                },
                              })
                            }}
                          />
                          {item.label}
                        </label>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h3>Backup & Restore</h3>
              </div>
              <div className="toggle-stack">
                <button type="button" className="primary-button" onClick={props.onExportData}>
                  Export JSON Backup
                </button>
                <label className="secondary-button" style={{ display: 'inline-flex', justifyContent: 'center', cursor: 'pointer' }}>
                  Restore JSON Backup
                  <input
                    type="file"
                    accept="application/json"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0]
                      if (file) {
                        props.onImportData(file)
                      }
                      event.target.value = ''
                    }}
                  />
                </label>
                <button type="button" className="danger-button" onClick={() => { if (window.confirm('Reset sales, expenses, allowances, commissions, and LD commissions? This cannot be undone.')) onResetSales() }}>
                  Reset Sales & Financial Records
                </button>
              </div>
            </div>
            <div className="panel span-2">
              <div className="panel-header split-header"><h3>Cashier & Staff Accounts</h3><button type="button" className="primary-button" onClick={() => openRecordEditor('employee')}>Add Account</button></div>
              <table className="data-table"><thead><tr><th>Name</th><th>Username</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>{appData.employees.filter((employee) => employee.role === 'Cashier' || employee.role === 'Staff').map((employee) => <tr key={employee.id}><td>{employee.fullName}</td><td>{employee.username}</td><td>{employee.role}</td><td>{employee.status}</td><td><button type="button" className="link-button danger-link" onClick={() => { if (window.confirm(`Delete ${employee.fullName}'s account?`)) onDeleteEmployee(employee.id) }}>Delete</button></td></tr>)}</tbody></table>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <div className="app-shell">
        <Sidebar currentUser={currentUser} activePage={activePage} setActivePage={setActivePage} sidebarCollapsed={sidebarCollapsed} onLogout={onLogout} rolePageAccess={appData.settings.rolePageAccess} />

          <main className="main-panel">
            <ExtractedTopBar currentUser={currentUser} activePage={activePage} currentTime={currentTime} theme={appData.settings.theme} onToggleSidebar={onToggleSidebar} onToggleTheme={onToggleTheme} />

            <div className="content-shell">{renderPage()}</div>
          </main>
      </div>

      <PaymentModal
        open={paymentModalOpen}
        paymentTotal={paymentTotal}
        paymentDraft={paymentDraft}
        setPaymentDraft={setPaymentDraft}
        paymentMethods={appData.settings.paymentMethods}
        calculatedChange={calculatedChange}
        onClose={() => onSetPaymentModalOpen(false)}
        onConfirm={onConfirmPayment}
      />

      <RecordEditorModal
        visible={Boolean(recordEditor)}
        kind={recordEditor?.kind ?? 'product'}
        onClose={resetRecordEditor}
        productForm={productForm}
        setProductForm={setProductForm}
        employeeForm={employeeForm}
        setEmployeeForm={setEmployeeForm}
        expenseForm={expenseForm}
        setExpenseForm={setExpenseForm}
        allowanceForm={allowanceForm}
        setAllowanceForm={setAllowanceForm}
        commissionForm={commissionForm}
        setCommissionForm={setCommissionForm}
        ldCommissionForm={ldCommissionForm}
        setLdCommissionForm={setLdCommissionForm}
        handleCreateProduct={handleCreateProduct}
        handleCreateEmployee={handleCreateEmployee}
        handleCreateExpense={handleCreateExpense}
        handleCreateAllowance={handleCreateAllowance}
        handleCreateCommission={handleCreateCommission}
        handleCreateLdCommission={handleCreateLdCommission}
        expenseCategories={appData.settings.expenseCategories}
        commissionCategories={appData.settings.commissionCategories}
        ldCommissionCategories={appData.settings.ldCommissionCategories}
        onAddCategory={onAddCategory}
      />

      <ReceiptModal sale={receiptSale} appData={appData} onClose={onCloseReceipt} onDirectPrint={onDirectPrint} />
    </>
  )
}
