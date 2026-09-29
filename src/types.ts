export type Role = 'Administrator' | 'Cashier' | 'Staff'
export type Theme = 'dark' | 'light'
export type PageId =
  | 'dashboard'
  | 'start-day'
  | 'pos'
  | 'sales-history'
  | 'end-shift'
  | 'products'
  | 'inventory'
  | 'employees'
  | 'expenses'
  | 'allowances'
  | 'commissions'
  | 'ld-commissions'
  | 'reports'
  | 'settings'

export type Status = 'active' | 'inactive'
export type SaleStatus = 'paid' | 'void'
export type PaymentMethod = 'cash' | 'card' | 'e-wallet' | 'other'
export type PrinterConnection = 'none' | 'bluetooth' | 'usb'
export type PrinterPaperWidth = '58mm' | '80mm'

export type User = {
  id: string
  name: string
  username: string
  role: Role
  pinHash: string
  status: Status
  createdAt: string
}

export type Employee = {
  id: string
  employeeId: string
  fullName: string
  username: string
  role: Role
  contact: string
  status: Status
  createdAt: string
}

export type Product = {
  id: string
  sku: string
  name: string
  category: string
  sellingPrice: number
  costPrice: number
  stock: number
  status: Status
  createdAt: string
  updatedAt: string
  variants?: ProductVariant[]
}

export type ProductVariant = {
  id: string
  name: string
  sellingPrice: number
}

export type SaleItem = {
  id: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  lineTotal: number
  variantId?: string
  variantName?: string
}

export type Sale = {
  id: string
  transactionNumber: string
  saleDate: string
  saleTime: string
  cashierId: string
  cashierName: string
  items: SaleItem[]
  subtotal: number
  discount: number
  variantId?: string
  variantName?: string
  total: number
  paymentMethod: PaymentMethod
  amountReceived: number
  change: number
  status: SaleStatus
  notes?: string
  voidedAt?: string
  voidedBy?: string
}

export type Shift = {
  id: string
  businessDate: string
  registerNumber: string
  cashierId: string
  cashierName: string
  openingCash: number
  notes: string
  openedAt: string
  closedAt?: string
  actualEndingCash?: number
  expectedCash?: number
  variance?: number
  status: 'open' | 'closed'
}

export type Expense = {
  id: string
  date: string
  category: string
  description: string
  amount: number
  payee: string
  createdBy: string
  status: Status
  createdAt: string
}

export type Allowance = {
  id: string
  employee: string
  date: string
  amount: number
  reason: string
  notes: string
  createdBy: string
  status: Status
  createdAt: string
}

export type Commission = {
  id: string
  employee: string
  date: string
  salesReference: string
  category?: string
  rate: number
  amount: number
  notes: string
  createdBy: string
  status: Status
  createdAt: string
}

export type LdCommission = {
  id: string
  employee: string
  date: string
  reference: string
  category?: string
  amount: number
  notes: string
  createdBy: string
  status: Status
  createdAt: string
}

export type AuditLog = {
  id: string
  userId: string
  action: string
  reference: string
  description: string
  createdAt: string
}

export type Settings = {
  businessName: string
  address: string
  phone: string
  receiptFooter: string
  theme: Theme
  paymentMethods: PaymentMethod[]
  printerConnection: PrinterConnection
  printerName: string
  printerId: string
  usbVendorId: number | null
  usbProductId: number | null
  printerPaperWidth: PrinterPaperWidth
  autoPrintReceipts: boolean
  rolePageAccess: Record<Role, PageId[]>
  currency: string
  expenseCategories: string[]
  commissionCategories: string[]
  ldCommissionCategories: string[]
}

export type AppData = {
  users: User[]
  employees: Employee[]
  products: Product[]
  sales: Sale[]
  shifts: Shift[]
  expenses: Expense[]
  allowances: Allowance[]
  commissions: Commission[]
  ldCommissions: LdCommission[]
  auditLogs: AuditLog[]
  settings: Settings
}

export type CartItem = {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  discount: number
  variantId?: string
  variantName?: string
}

export type ToastState = {
  text: string
  tone: 'success' | 'error' | 'info'
}

export type FormState = {
  businessDate: string
  openingCash: string
  registerNumber: string
  notes: string
}

export type RecordEditorKind =
  | 'product'
  | 'employee'
  | 'expense'
  | 'allowance'
  | 'commission'
  | 'ldCommission'

export type ProductFormState = {
  sku: string
  name: string
  category: string
  sellingPrice: string
  costPrice: string
  stock: string
  status: Status
  variants: Array<{ id: string; name: string; sellingPrice: string }>
}

export type EmployeeFormState = {
  employeeId: string
  fullName: string
  username: string
  role: Role
  contact: string
  status: Status
  pin: string
}

export type ExpenseFormState = {
  date: string
  category: string
  description: string
  amount: string
  payee: string
}

export type AllowanceFormState = {
  employee: string
  date: string
  amount: string
  reason: string
  notes: string
}

export type CommissionFormState = {
  employee: string
  date: string
  category: string
  rate: string
  amount: string
  notes: string
}

export type LdCommissionFormState = {
  employee: string
  date: string
  category: string
  amount: string
  notes: string
}
