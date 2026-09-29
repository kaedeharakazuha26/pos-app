import { getBusinessDate, hashPin } from './pos-utils'
import type { AppData, Employee, Product, User } from './types'

export const STORAGE_KEY = 'joycepos-state-v1'
export const SESSION_KEY = 'joycepos-user-v1'

export const buildSeedState = (): AppData => {
  const users: User[] = [
    {
      id: 'user-admin',
      name: 'Maria Clarke',
      username: 'admin',
      role: 'Administrator',
      pinHash: hashPin('1234'),
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-cashier',
      name: 'Aisha Morgan',
      username: 'cashier',
      role: 'Cashier',
      pinHash: hashPin('1111'),
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'user-staff',
      name: 'Leo Carter',
      username: 'staff',
      role: 'Staff',
      pinHash: hashPin('2222'),
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ]

  const employees: Employee[] = [
    {
      id: 'emp-1',
      employeeId: 'EMP-1001',
      fullName: 'Aisha Morgan',
      username: 'cashier',
      role: 'Cashier',
      contact: '+1-555-0112',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'emp-2',
      employeeId: 'EMP-1002',
      fullName: 'Leo Carter',
      username: 'staff',
      role: 'Staff',
      contact: '+1-555-0199',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ]

  const products: Product[] = [
    {
      id: 'prod-1',
      sku: 'SKU-001',
      name: 'Classic Espresso',
      category: 'Coffee',
      sellingPrice: 4.5,
      costPrice: 1.8,
      stock: 45,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-2',
      sku: 'SKU-002',
      name: 'Cappuccino',
      category: 'Coffee',
      sellingPrice: 5.75,
      costPrice: 2.2,
      stock: 38,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-3',
      sku: 'SKU-003',
      name: 'Croissant',
      category: 'Bakery',
      sellingPrice: 3.25,
      costPrice: 1.35,
      stock: 50,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-4',
      sku: 'SKU-004',
      name: 'Chicken Wrap',
      category: 'Meals',
      sellingPrice: 12.5,
      costPrice: 5.4,
      stock: 24,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-5',
      sku: 'SKU-005',
      name: 'Lemonade',
      category: 'Drinks',
      sellingPrice: 4.25,
      costPrice: 1.7,
      stock: 60,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]

  const now = new Date().toISOString()

  return {
    users,
    employees,
    products,
    sales: [
      {
        id: 'sale-1',
        transactionNumber: 'TXN-1001',
        saleDate: getBusinessDate(),
        saleTime: '09:15',
        cashierId: 'user-cashier',
        cashierName: 'Aisha Morgan',
        items: [
          {
            id: 'sale-item-1',
            productId: 'prod-1',
            productName: 'Classic Espresso',
            quantity: 2,
            unitPrice: 4.5,
            discount: 0,
            lineTotal: 9,
          },
          {
            id: 'sale-item-2',
            productId: 'prod-3',
            productName: 'Croissant',
            quantity: 1,
            unitPrice: 3.25,
            discount: 0,
            lineTotal: 3.25,
          },
        ],
        subtotal: 12.25,
        discount: 0,
        total: 12.25,
        paymentMethod: 'cash',
        amountReceived: 15,
        change: 2.75,
        status: 'paid',
      },
    ],
    shifts: [],
    expenses: [
      {
        id: 'exp-1',
        date: getBusinessDate(),
        category: 'Utilities',
        description: 'Coffee machine electricity',
        amount: 34.5,
        payee: 'PowerCo',
        createdBy: 'Maria Clarke',
        status: 'active',
        createdAt: now,
      },
    ],
    allowances: [
      {
        id: 'allow-1',
        employee: 'Aisha Morgan',
        date: getBusinessDate(),
        amount: 25,
        reason: 'Performance bonus',
        notes: 'Quarterly staff reward',
        createdBy: 'Maria Clarke',
        status: 'active',
        createdAt: now,
      },
    ],
    commissions: [
      {
        id: 'comm-1',
        employee: 'Aisha Morgan',
        date: getBusinessDate(),
        salesReference: 'TXN-1001',
        rate: 0.08,
        amount: 0.98,
        notes: '8% sales commission',
        createdBy: 'Maria Clarke',
        status: 'active',
        createdAt: now,
      },
    ],
    ldCommissions: [
      {
        id: 'ld-1',
        employee: 'Leo Carter',
        date: getBusinessDate(),
        reference: 'LD-204',
        amount: 15,
        notes: 'Lead referral bonus',
        createdBy: 'Maria Clarke',
        status: 'active',
        createdAt: now,
      },
    ],
    auditLogs: [
      {
        id: 'audit-1',
        userId: 'user-admin',
        action: 'Login',
        reference: 'user-admin',
        description: 'Administrator signed in',
        createdAt: now,
      },
    ],
    settings: {
      businessName: 'Joyce POS',
      address: '48 East Market Street, Suite 203',
      phone: '+1 (555) 014-0987',
      receiptFooter: 'Thank you for shopping with Joyce POS',
      theme: 'dark',
      paymentMethods: ['cash', 'card', 'e-wallet', 'other'],
      printerConnection: 'none',
      printerName: '',
      printerId: '',
      usbVendorId: null,
      usbProductId: null,
      printerPaperWidth: '80mm',
      autoPrintReceipts: false,
      rolePageAccess: {
        Administrator: ['dashboard', 'start-day', 'pos', 'end-shift', 'sales-history', 'products', 'inventory', 'employees', 'expenses', 'allowances', 'commissions', 'ld-commissions', 'reports', 'settings'],
        Cashier: ['dashboard', 'start-day', 'pos', 'end-shift', 'sales-history', 'products', 'inventory', 'expenses', 'allowances', 'commissions', 'ld-commissions', 'reports'],
        Staff: ['dashboard', 'sales-history'],
      },
      currency: 'USD',
      expenseCategories: ['Utilities', 'Supplies', 'Rent', 'Transport', 'Other'],
      commissionCategories: ['Sales Commission', 'Referral', 'Bonus', 'Other'],
      ldCommissionCategories: ['Lead Referral', 'Partner Payout', 'Bonus', 'Other'],
    },
  }
}

export const readPersistedState = (): AppData => {
  if (typeof window === 'undefined') {
    return buildSeedState()
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed && parsed.users) {
        const seed = buildSeedState()
        return {
          ...seed,
          ...parsed,
          products: parsed.products.map((product) => ({ ...product, variants: product.variants || [] })),
          settings: {
            ...seed.settings,
            ...parsed.settings,
          },
        }
      }
    }
  } catch {
    // falls back to seeded state below
  }

  return buildSeedState()
}
