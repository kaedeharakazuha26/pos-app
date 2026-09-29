import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { AppContent, AppToast } from "./components/AppContent";
import type { ReportMenu } from "./components/pages/ReportsPage";
import { buildSeedState, SESSION_KEY } from "./data";
import {
  loadAppDataFromStorage,
  saveAppDataToStorage,
} from "./lib/sqliteStorage";
import {
  formatCurrency,
  generateId,
  getAllowedPages,
  getBusinessDate,
  hashPin,
  setActiveCurrency,
  toNumber,
} from "./pos-utils";
import type {
  Allowance,
  AppData,
  CartItem,
  Commission,
  Employee,
  Expense,
  FormState,
  LdCommission,
  PageId,
  PaymentMethod,
  Product,
  ProductFormState,
  RecordEditorKind,
  Role,
  Sale,
  SaleItem,
  Shift,
  Status,
  ToastState,
  User,
} from "./types";

type DirectUsbDevice = {
  vendorId: number;
  productId: number;
  productName?: string;
  opened: boolean;
  configuration: {
    interfaces: Array<{
      interfaceNumber: number;
      alternates: Array<{
        endpoints: Array<{ endpointNumber: number; direction: string }>;
      }>;
    }>;
  } | null;
  open: () => Promise<void>;
  close: () => Promise<void>;
  selectConfiguration: (configurationValue: number) => Promise<void>;
  claimInterface: (interfaceNumber: number) => Promise<void>;
  transferOut: (endpointNumber: number, data: Uint8Array) => Promise<unknown>;
};

type DirectBluetoothCharacteristic = {
  properties: { write?: boolean; writeWithoutResponse?: boolean };
  writeValue: (value: BufferSource) => Promise<void>;
};

type DirectBluetoothService = {
  getCharacteristics: () => Promise<DirectBluetoothCharacteristic[]>;
};

type DirectBluetoothServer = {
  getPrimaryServices: () => Promise<DirectBluetoothService[]>;
};

type DirectBluetoothDevice = {
  id: string;
  name?: string;
  gatt?: {
    connected: boolean;
    connect: () => Promise<DirectBluetoothServer>;
    getPrimaryServices: () => Promise<DirectBluetoothService[]>;
  };
};

type DirectPrinterNavigator = Navigator & {
  usb?: {
    getDevices: () => Promise<DirectUsbDevice[]>;
    requestDevice: (options: { filters: never[] }) => Promise<DirectUsbDevice>;
  };
  bluetooth?: {
    getDevices?: () => Promise<DirectBluetoothDevice[]>;
    requestDevice: (options: {
      acceptAllDevices: boolean;
    }) => Promise<DirectBluetoothDevice>;
  };
};

const buildEscPosReceipt = (sale: Sale, settings: AppData["settings"]) => {
  const lines = [
    "\x1b@",
    "\x1ba\x01",
    settings.businessName,
    settings.address,
    settings.phone,
    "\x1ba\x00",
    "--------------------------------",
    `Receipt: ${sale.transactionNumber}`,
    `${sale.saleDate} ${sale.saleTime}`,
    `Cashier: ${sale.cashierName}`,
    "--------------------------------",
    ...sale.items.map(
      (item) =>
        `${item.productName} x${item.quantity}  ${item.lineTotal.toFixed(2)}`,
    ),
    "--------------------------------",
    `Subtotal: ${sale.subtotal.toFixed(2)}`,
    `Discount: ${sale.discount.toFixed(2)}`,
    `TOTAL: ${sale.total.toFixed(2)}`,
    `Paid: ${sale.amountReceived.toFixed(2)}`,
    `Change: ${sale.change.toFixed(2)}`,
    `Method: ${sale.paymentMethod}`,
    "",
    settings.receiptFooter,
    "",
    "",
    "\x1dV\x00",
  ];
  return new TextEncoder().encode(`${lines.join("\n")}\n`);
};

function App() {
  const [appData, setAppData] = useState<AppData>({
    users: [],
    employees: [],
    products: [],
    sales: [],
    shifts: [],
    expenses: [],
    allowances: [],
    commissions: [],
    ldCommissions: [],
    auditLogs: [],
    settings: {
      businessName: "Joyce POS",
      address: "",
      phone: "",
      receiptFooter: "",
      theme: "dark",
      paymentMethods: ["cash", "card", "e-wallet", "other"],
      printerConnection: "none",
      printerName: "",
      printerId: "",
      usbVendorId: null,
      usbProductId: null,
      printerPaperWidth: "80mm",
      autoPrintReceipts: false,
      rolePageAccess: {
        Administrator: [
          "dashboard",
          "start-day",
          "pos",
          "end-shift",
          "sales-history",
          "products",
          "inventory",
          "employees",
          "expenses",
          "allowances",
          "commissions",
          "ld-commissions",
          "reports",
          "settings",
        ],
        Cashier: [
          "dashboard",
          "start-day",
          "pos",
          "end-shift",
          "sales-history",
          "products",
          "inventory",
          "expenses",
          "allowances",
          "commissions",
          "ld-commissions",
          "reports",
        ],
        Staff: ["dashboard", "sales-history"],
      },
      currency: "USD",
      expenseCategories: [
        "Utilities",
        "Supplies",
        "Rent",
        "Transport",
        "Other",
      ],
      commissionCategories: ["Sales Commission", "Referral", "Bonus", "Other"],
      ldCommissionCategories: [
        "Lead Referral",
        "Partner Payout",
        "Bonus",
        "Other",
      ],
    },
  });
  setActiveCurrency(appData.settings.currency);
  const [databaseReady, setDatabaseReady] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    return localStorage.getItem(SESSION_KEY) || null;
  });
  const [selectedUserId, setSelectedUserId] = useState<string>("user-admin");
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [pinInput, setPinInput] = useState("");
  const [toast, setToast] = useState<ToastState | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [salesSearchTerm, setSalesSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDraft, setPaymentDraft] = useState({
    method: "cash" as PaymentMethod,
    amountReceived: "",
    notes: "",
  });
  const [receiptSale, setReceiptSale] = useState<Sale | null>(null);
  const [shiftForm, setShiftForm] = useState<FormState>({
    businessDate: getBusinessDate(),
    openingCash: "250",
    registerNumber: "REG-01",
    notes: "Opening cash ready",
  });
  const [closeShiftForm, setCloseShiftForm] = useState({
    actualEndingCash: "0",
    notes: "",
  });
  const [recordEditor, setRecordEditor] = useState<{
    kind:
      | "product"
      | "employee"
      | "expense"
      | "allowance"
      | "commission"
      | "ldCommission";
    data: Record<string, string>;
  } | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>({
    sku: "SKU-100",
    name: "",
    category: "Coffee",
    sellingPrice: "0",
    costPrice: "0",
    stock: "0",
    status: "active" as Status,
    variants: [],
  });
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: "EMP-2000",
    fullName: "",
    username: "",
    role: "Cashier" as Role,
    contact: "",
    status: "active" as Status,
    pin: "1111",
  });
  const [expenseForm, setExpenseForm] = useState({
    date: getBusinessDate(),
    category: "Utilities",
    description: "",
    amount: "0",
    payee: "",
  });
  const [allowanceForm, setAllowanceForm] = useState({
    employee: "Aisha Morgan",
    date: getBusinessDate(),
    amount: "0",
    reason: "",
    notes: "",
  });
  const [commissionForm, setCommissionForm] = useState({
    employee: "Aisha Morgan",
    date: getBusinessDate(),
    category: "Sales Commission",
    rate: "0.10",
    amount: "0",
    notes: "",
  });
  const [ldCommissionForm, setLdCommissionForm] = useState({
    employee: "Leo Carter",
    date: getBusinessDate(),
    category: "Lead Referral",
    amount: "0",
    notes: "",
  });

  const currentUser = useMemo(
    () => appData.users.find((user) => user.id === loggedInUserId) || null,
    [appData.users, loggedInUserId],
  );

  const openShift = useMemo(
    () => appData.shifts.find((shift) => shift.status === "open") || null,
    [appData.shifts],
  );

  const registerLocked = !openShift;

  useEffect(() => {
    let isMounted = true;

    const initializeData = async () => {
      const initialState = await loadAppDataFromStorage();
      if (!isMounted) {
        return;
      }

      setAppData(initialState);
      setSelectedUserId(initialState.users[0]?.id || "user-admin");
      setDatabaseReady(true);
    };

    initializeData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentTime(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!databaseReady) {
      return;
    }

    saveAppDataToStorage(appData);
  }, [appData, databaseReady]);

  useEffect(() => {
    if (loggedInUserId) {
      localStorage.setItem(SESSION_KEY, loggedInUserId);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [loggedInUserId]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appData.settings.theme);
  }, [appData.settings.theme]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const addAuditLog = (
    action: string,
    description: string,
    reference: string,
    userId = currentUser?.id || "system",
  ) => {
    setAppData((previous) => ({
      ...previous,
      auditLogs: [
        {
          id: generateId("audit"),
          userId,
          action,
          reference,
          description,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
  };

  const handleLogin = () => {
    const selectedUser = appData.users.find(
      (user) => user.id === selectedUserId,
    );

    if (!selectedUser) {
      setToast({ text: "Unable to find the selected user.", tone: "error" });
      return;
    }

    if (selectedUser.pinHash !== hashPin(pinInput)) {
      setToast({ text: "Invalid PIN. Please try again.", tone: "error" });
      return;
    }

    if (selectedUser.status !== "active") {
      setToast({ text: "This account is currently inactive.", tone: "error" });
      return;
    }

    setLoggedInUserId(selectedUser.id);
    setPinInput("");
    setActivePage(getAllowedPages(selectedUser.role)[0] || "dashboard");
    addAuditLog(
      "Login",
      `${selectedUser.name} signed in`,
      selectedUser.id,
      selectedUser.id,
    );
    setToast({ text: `Welcome back, ${selectedUser.name}.`, tone: "success" });
  };

  const handleLogout = () => {
    if (currentUser) {
      addAuditLog(
        "Logout",
        `${currentUser.name} signed out`,
        currentUser.id,
        currentUser.id,
      );
    }
    setLoggedInUserId(null);
    setPinInput("");
    setCart([]);
    setPaymentModalOpen(false);
  };

  const handleExportData = () => {
    const payload = JSON.stringify(appData, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `joycepos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast({ text: "Backup exported successfully.", tone: "success" });
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const result = reader.result;
        if (typeof result !== "string") {
          throw new Error("Invalid backup file");
        }

        const parsed = JSON.parse(result) as AppData;
        if (!parsed || !parsed.users || !parsed.products) {
          throw new Error("Unexpected backup schema");
        }

        const seed = buildSeedState();
        setAppData({
          ...seed,
          ...parsed,
          settings: {
            ...seed.settings,
            ...parsed.settings,
          },
        });
        setToast({ text: "Backup restored successfully.", tone: "success" });
      } catch {
        setToast({
          text: "Unable to restore backup. Please check the file format.",
          tone: "error",
        });
      }
    };
    reader.readAsText(file);
  };

  const resetRecordEditor = () => setRecordEditor(null);

  const openRecordEditor = (kind: RecordEditorKind) => {
    setRecordEditor({ kind, data: {} });
  };

  const handleCreateProduct = () => {
    const sku = productForm.sku.trim();
    const name = productForm.name.trim();
    if (!sku || !name) {
      setToast({ text: "Product SKU and name are required.", tone: "error" });
      return;
    }

    const salePrice = toNumber(productForm.sellingPrice);
    const costPrice = toNumber(productForm.costPrice);
    const stock = Math.max(0, Math.floor(toNumber(productForm.stock)));

    const newProduct: Product = {
      id: generateId("product"),
      sku,
      name,
      category: productForm.category,
      sellingPrice: salePrice,
      costPrice: costPrice,
      stock,
      status: productForm.status,
      variants: productForm.variants
        .slice(0, 20)
        .filter((variant) => variant.name.trim())
        .map((variant) => ({
          id: variant.id,
          name: variant.name.trim(),
          sellingPrice: toNumber(variant.sellingPrice),
        })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      products: [newProduct, ...previous.products],
    }));
    setRecordEditor(null);
    setProductForm({
      sku: `SKU-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      category: "Coffee",
      sellingPrice: "0",
      costPrice: "0",
      stock: "0",
      status: "active",
      variants: [],
    });
    setToast({ text: "Product added successfully.", tone: "success" });
  };

  const handleRestock = (productId: string, quantity: number) => {
    if (!currentUser || quantity <= 0) return;
    setAppData((previous) => ({
      ...previous,
      products: previous.products.map((product) =>
        product.id === productId
          ? {
              ...product,
              stock: product.stock + Math.floor(quantity),
              updatedAt: new Date().toISOString(),
            }
          : product,
      ),
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Restock",
          reference: productId,
          description: `${currentUser.name} restocked ${quantity} units`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
    setToast({ text: "Inventory restocked successfully.", tone: "success" });
  };

  const handleDeleteProduct = (productId: string) => {
    if (!currentUser || currentUser.role !== "Administrator") return;
    setAppData((previous) => ({
      ...previous,
      products: previous.products.filter((product) => product.id !== productId),
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Delete Product",
          reference: productId,
          description: `${currentUser.name} deleted product ${productId}`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
    setToast({ text: "Product deleted.", tone: "success" });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (!currentUser || currentUser.role !== "Administrator") return;
    const employee = appData.employees.find((entry) => entry.id === employeeId);
    if (!employee) return;
    setAppData((previous) => ({
      ...previous,
      employees: previous.employees.filter((entry) => entry.id !== employeeId),
      users: previous.users.filter(
        (user) => user.username !== employee.username,
      ),
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Delete Employee",
          reference: employeeId,
          description: `${currentUser.name} deleted employee ${employee.fullName}`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
    setToast({ text: "Employee and linked login deleted.", tone: "success" });
  };

  const handleResetSales = () => {
    if (!currentUser || currentUser.role !== "Administrator") return;
    setAppData((previous) => ({
      ...previous,
      sales: [],
      expenses: [],
      allowances: [],
      commissions: [],
      ldCommissions: [],
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Reset Sales",
          reference: "sales",
          description: `${currentUser.name} reset the sales database`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
    setToast({ text: "Sales database reset.", tone: "success" });
  };

  const handleDeleteReport = (menu: ReportMenu, id: string) => {
    if (!currentUser || currentUser.role !== "Administrator") return;
    setAppData((previous) => {
      const next = { ...previous };
      if (menu === "sales" || menu === "void")
        next.sales = previous.sales.filter((entry) => entry.id !== id);
      if (menu === "expenses")
        next.expenses = previous.expenses.filter((entry) => entry.id !== id);
      if (menu === "allowance")
        next.allowances = previous.allowances.filter(
          (entry) => entry.id !== id,
        );
      if (menu === "commission")
        next.commissions = previous.commissions.filter(
          (entry) => entry.id !== id,
        );
      if (menu === "ld-commission")
        next.ldCommissions = previous.ldCommissions.filter(
          (entry) => entry.id !== id,
        );
      next.auditLogs = [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Delete Report",
          reference: id,
          description: `${currentUser.name} deleted a ${menu} report record`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120);
      return next;
    });
    setToast({ text: "Report record deleted.", tone: "success" });
  };

  const handleAddCategory = (
    kind: "expense" | "commission" | "ldCommission",
  ) => {
    const value = window.prompt("Enter a new category")?.trim();
    if (!value) return;
    const field =
      kind === "expense"
        ? "expenseCategories"
        : kind === "commission"
          ? "commissionCategories"
          : "ldCommissionCategories";
    setAppData((previous) => ({
      ...previous,
      settings: {
        ...previous.settings,
        [field]: [...new Set([...previous.settings[field], value])],
      },
    }));
  };

  const handleCreateEmployee = () => {
    const fullName = employeeForm.fullName.trim();
    const username = employeeForm.username.trim();
    if (!fullName || !username || employeeForm.pin.trim().length < 4) {
      setToast({
        text: "Employee name, username, and a PIN of at least 4 digits are required.",
        tone: "error",
      });
      return;
    }
    if (
      appData.users.some(
        (user) => user.username.toLowerCase() === username.toLowerCase(),
      )
    ) {
      setToast({ text: "That username is already in use.", tone: "error" });
      return;
    }

    const newEmployee: Employee = {
      id: generateId("employee"),
      employeeId: employeeForm.employeeId,
      fullName,
      username,
      role: employeeForm.role,
      contact: employeeForm.contact,
      status: employeeForm.status,
      createdAt: new Date().toISOString(),
    };
    const newUser: User = {
      id: generateId("user"),
      name: fullName,
      username,
      role: employeeForm.role,
      pinHash: hashPin(employeeForm.pin),
      status: employeeForm.status,
      createdAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      employees: [newEmployee, ...previous.employees],
      users: [newUser, ...previous.users],
    }));
    setRecordEditor(null);
    setEmployeeForm({
      employeeId: `EMP-${Math.floor(2000 + Math.random() * 9000)}`,
      fullName: "",
      username: "",
      role: "Cashier",
      contact: "",
      status: "active",
      pin: "1111",
    });
    setToast({ text: "Employee added successfully.", tone: "success" });
  };

  const handleCreateExpense = () => {
    if (!expenseForm.description.trim() || !expenseForm.payee.trim()) {
      setToast({
        text: "Expense description and payee are required.",
        tone: "error",
      });
      return;
    }

    const newExpense: Expense = {
      id: generateId("expense"),
      date: expenseForm.date,
      category: expenseForm.category,
      description: expenseForm.description.trim(),
      amount: toNumber(expenseForm.amount),
      payee: expenseForm.payee.trim(),
      createdBy: currentUser?.name || "System",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      expenses: [newExpense, ...previous.expenses],
    }));
    setRecordEditor(null);
    setExpenseForm({
      date: getBusinessDate(),
      category: "Utilities",
      description: "",
      amount: "0",
      payee: "",
    });
    setToast({ text: "Expense recorded successfully.", tone: "success" });
  };

  const handleCreateAllowance = () => {
    if (!allowanceForm.employee.trim() || !allowanceForm.reason.trim()) {
      setToast({ text: "Employee and reason are required.", tone: "error" });
      return;
    }

    const newAllowance: Allowance = {
      id: generateId("allowance"),
      employee: allowanceForm.employee.trim(),
      date: allowanceForm.date,
      amount: toNumber(allowanceForm.amount),
      reason: allowanceForm.reason.trim(),
      notes: allowanceForm.notes.trim(),
      createdBy: currentUser?.name || "System",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      allowances: [newAllowance, ...previous.allowances],
    }));
    setRecordEditor(null);
    setAllowanceForm({
      employee: "Aisha Morgan",
      date: getBusinessDate(),
      amount: "0",
      reason: "",
      notes: "",
    });
    setToast({ text: "Allowance added successfully.", tone: "success" });
  };

  const handleCreateCommission = () => {
    if (!commissionForm.employee.trim() || !commissionForm.category.trim()) {
      setToast({
        text: "Employee and commission category are required.",
        tone: "error",
      });
      return;
    }

    const rate = toNumber(commissionForm.rate);
    const amount = toNumber(commissionForm.amount);

    const newCommission: Commission = {
      id: generateId("commission"),
      employee: commissionForm.employee.trim(),
      date: commissionForm.date,
      salesReference: commissionForm.category.trim(),
      category: commissionForm.category.trim(),
      rate: Number.isFinite(rate) ? rate : 0,
      amount: Number.isFinite(amount) ? amount : 0,
      notes: commissionForm.notes.trim(),
      createdBy: currentUser?.name || "System",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      commissions: [newCommission, ...previous.commissions],
    }));
    setRecordEditor(null);
    setCommissionForm({
      employee: "Aisha Morgan",
      date: getBusinessDate(),
      category: "Sales Commission",
      rate: "0.10",
      amount: "0",
      notes: "",
    });
    setToast({ text: "Commission added successfully.", tone: "success" });
  };

  const handleCreateLdCommission = () => {
    if (
      !ldCommissionForm.employee.trim() ||
      !ldCommissionForm.category.trim()
    ) {
      setToast({
        text: "Employee and LD commission category are required.",
        tone: "error",
      });
      return;
    }

    const newEntry: LdCommission = {
      id: generateId("ld-commission"),
      employee: ldCommissionForm.employee.trim(),
      date: ldCommissionForm.date,
      reference: ldCommissionForm.category.trim(),
      category: ldCommissionForm.category.trim(),
      amount: toNumber(ldCommissionForm.amount),
      notes: ldCommissionForm.notes.trim(),
      createdBy: currentUser?.name || "System",
      status: "active",
      createdAt: new Date().toISOString(),
    };

    setAppData((previous) => ({
      ...previous,
      ldCommissions: [newEntry, ...previous.ldCommissions],
    }));
    setRecordEditor(null);
    setLdCommissionForm({
      employee: "Leo Carter",
      date: getBusinessDate(),
      category: "Lead Referral",
      amount: "0",
      notes: "",
    });
    setToast({ text: "LD commission added successfully.", tone: "success" });
  };

  const productsByCategory = useMemo(
    () => [
      "All",
      ...new Set(appData.products.map((product) => product.category)),
    ],
    [appData.products],
  );

  const filteredProducts = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    return appData.products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesSearch =
        !search ||
        product.name.toLowerCase().includes(search) ||
        product.sku.toLowerCase().includes(search);
      return matchesCategory && matchesSearch && product.status === "active";
    });
  }, [appData.products, searchTerm, selectedCategory]);

  const filteredSales = useMemo(() => {
    const query = salesSearchTerm.trim().toLowerCase();
    return appData.sales.filter((sale) => {
      if (!query) {
        return true;
      }

      return (
        sale.transactionNumber.toLowerCase().includes(query) ||
        sale.cashierName.toLowerCase().includes(query) ||
        sale.paymentMethod.toLowerCase().includes(query)
      );
    });
  }, [appData.sales, salesSearchTerm]);

  const lowStockProducts = useMemo(
    () =>
      appData.products.filter(
        (product) => product.status === "active" && product.stock <= 10,
      ),
    [appData.products],
  );

  const recentAuditLogs = useMemo(
    () => appData.auditLogs.slice(0, 8),
    [appData.auditLogs],
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const itemTotal = (item.unitPrice - item.discount) * item.quantity;
        return sum + itemTotal;
      }, 0),
    [cart],
  );

  const paymentTotal = cartTotal;
  const paymentDue = Number(paymentDraft.amountReceived || 0);
  const calculatedChange = Math.max(paymentDue - paymentTotal, 0);

  const addItemToCart = (
    product: Product,
    variant?: { id: string; name: string; sellingPrice: number },
  ) => {
    if (registerLocked) {
      setToast({
        text: "Register is locked. Complete Start of Day first.",
        tone: "error",
      });
      return;
    }

    const productQuantity = cart
      .filter((item) => item.productId === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);
    if (productQuantity >= product.stock) {
      setToast({
        text: `${product.name} has no more stock available.`,
        tone: "error",
      });
      return;
    }

    setCart((currentCart) => {
      const existing = currentCart.find(
        (item) =>
          item.productId === product.id && item.variantId === variant?.id,
      );
      if (existing) {
        return currentCart.map((item) =>
          item.productId === product.id && item.variantId === variant?.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...currentCart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: variant?.sellingPrice ?? product.sellingPrice,
          discount: 0,
          variantId: variant?.id,
          variantName: variant?.name,
        },
      ];
    });
  };

  const updateCartQuantity = (
    productId: string,
    direction: number,
    variantId?: string,
  ) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: Math.max(0, item.quantity + direction) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleStartDay = () => {
    if (!currentUser) {
      return;
    }

    const duplicate = appData.shifts.some(
      (shift) =>
        shift.businessDate === shiftForm.businessDate &&
        shift.registerNumber === shiftForm.registerNumber &&
        shift.status === "open",
    );

    if (duplicate) {
      setToast({
        text: "A shift is already open for this register and date.",
        tone: "error",
      });
      return;
    }

    const newShift: Shift = {
      id: generateId("shift"),
      businessDate: shiftForm.businessDate,
      registerNumber: shiftForm.registerNumber,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      openingCash: toNumber(shiftForm.openingCash),
      notes: shiftForm.notes,
      openedAt: new Date().toISOString(),
      status: "open",
    };

    setAppData((previous) => ({
      ...previous,
      shifts: [newShift, ...previous.shifts],
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Start of Day",
          reference: newShift.id,
          description: `${currentUser.name} opened ${newShift.registerNumber} for ${newShift.businessDate}`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));

    setToast({
      text: "Start of Day completed. Register is now unlocked.",
      tone: "success",
    });
    setActivePage("dashboard");
  };

  const handleConfirmPayment = () => {
    if (!currentUser || !openShift || cart.length === 0) {
      return;
    }

    const due = paymentTotal;
    const received = toNumber(paymentDraft.amountReceived);
    if (received < due) {
      setToast({
        text: "The received amount is less than the total due.",
        tone: "error",
      });
      return;
    }

    const saleId = generateId("sale");
    const transactionNumber = `TXN-${Math.max(1001, appData.sales.length + 1001)}`;
    const saleDate = new Date().toISOString();
    const saleItems: SaleItem[] = cart.map((item) => {
      const lineTotal = (item.unitPrice - item.discount) * item.quantity;
      return {
        id: generateId("sale-item"),
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        lineTotal,
      };
    });

    const subtotal = saleItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discount = saleItems.reduce(
      (sum, item) => sum + item.discount * item.quantity,
      0,
    );
    const total = subtotal - discount;

    const paymentMethod = paymentDraft.method;
    const sale: Sale = {
      id: saleId,
      transactionNumber,
      saleDate: getBusinessDate(),
      saleTime: new Date(saleDate).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      amountReceived: received,
      change: received - total,
      status: "paid",
      notes: paymentDraft.notes,
    };

    setAppData((previous) => {
      const updatedProducts = previous.products.map((product) => {
        const quantity = cart
          .filter((entry) => entry.productId === product.id)
          .reduce((sum, entry) => sum + entry.quantity, 0);
        if (!quantity) {
          return product;
        }

        return {
          ...product,
          stock: Math.max(0, product.stock - quantity),
          updatedAt: new Date().toISOString(),
        };
      });

      return {
        ...previous,
        sales: [sale, ...previous.sales],
        products: updatedProducts,
        auditLogs: [
          {
            id: generateId("audit"),
            userId: currentUser.id,
            action: "Sale",
            reference: sale.transactionNumber,
            description: `${currentUser.name} completed sale ${sale.transactionNumber}`,
            createdAt: new Date().toISOString(),
          },
          ...previous.auditLogs,
        ].slice(0, 120),
      };
    });

    setToast({
      text: `Sale ${transactionNumber} saved successfully.`,
      tone: "success",
    });
    setCart([]);
    setPaymentDraft({ method: "cash", amountReceived: "", notes: "" });
    setPaymentModalOpen(false);
    setReceiptSale(sale);
  };

  const handleVoidSale = (saleId: string) => {
    if (
      !currentUser ||
      !["Administrator", "Cashier"].includes(currentUser.role)
    ) {
      setToast({
        text: "You do not have permission to void sales.",
        tone: "error",
      });
      return;
    }

    const sale = appData.sales.find((entry) => entry.id === saleId);
    if (!sale || sale.status === "void") {
      setToast({
        text: "This sale is already void or could not be found.",
        tone: "error",
      });
      return;
    }

    setAppData((previous) => ({
      ...previous,
      sales: previous.sales.map((entry) =>
        entry.id === saleId
          ? {
              ...entry,
              status: "void",
              voidedAt: new Date().toISOString(),
              voidedBy: currentUser.name,
            }
          : entry,
      ),
      products: previous.products.map((product) => {
        const item = sale.items.find(
          (saleItem) => saleItem.productId === product.id,
        );
        return item
          ? {
              ...product,
              stock: product.stock + item.quantity,
              updatedAt: new Date().toISOString(),
            }
          : product;
      }),
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "Void Sale",
          reference: sale.transactionNumber,
          description: `${currentUser.name} voided ${sale.transactionNumber}`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));
    setReceiptSale(null);
    setToast({
      text: `${sale.transactionNumber} was voided and inventory restored.`,
      tone: "success",
    });
  };

  const handleDirectPrint = async (sale: Sale) => {
    const printerNavigator = navigator as DirectPrinterNavigator;
    const connection = appData.settings.printerConnection;
    const payload = buildEscPosReceipt(sale, appData.settings);

    try {
      if (connection === "usb") {
        if (!printerNavigator.usb) {
          throw new Error(
            "Direct USB printing is unavailable in this runtime.",
          );
        }

        const devices = await printerNavigator.usb.getDevices();
        const selected =
          devices.find(
            (device) =>
              device.vendorId === appData.settings.usbVendorId &&
              device.productId === appData.settings.usbProductId,
          ) || (await printerNavigator.usb.requestDevice({ filters: [] }));

        await selected.open();
        if (!selected.configuration) {
          await selected.selectConfiguration(1);
        }

        const configuration = selected.configuration;
        const endpoint = configuration?.interfaces
          .flatMap((usbInterface) => usbInterface.alternates)
          .flatMap((alternate) => alternate.endpoints)
          .find((usbEndpoint) => usbEndpoint.direction === "out");

        if (!endpoint) {
          throw new Error("No writable USB printer endpoint was found.");
        }

        const usbInterface = configuration?.interfaces.find((usbInterface) =>
          usbInterface.alternates.some((alternate) =>
            alternate.endpoints.includes(endpoint),
          ),
        );
        if (!usbInterface) {
          throw new Error("No writable USB printer interface was found.");
        }

        await selected.claimInterface(usbInterface.interfaceNumber);
        for (let offset = 0; offset < payload.length; offset += 4096) {
          await selected.transferOut(
            endpoint.endpointNumber,
            payload.slice(offset, offset + 4096),
          );
        }
        await selected.close();
        setToast({
          text: "Receipt sent directly to the USB printer.",
          tone: "success",
        });
        return;
      }

      if (connection === "bluetooth") {
        if (!printerNavigator.bluetooth) {
          throw new Error(
            "Direct Bluetooth printing is unavailable in this runtime.",
          );
        }

        const pairedDevices = printerNavigator.bluetooth.getDevices
          ? await printerNavigator.bluetooth.getDevices()
          : [];
        const device =
          pairedDevices.find(
            (entry) => entry.id === appData.settings.printerId,
          ) ||
          (await printerNavigator.bluetooth.requestDevice({
            acceptAllDevices: true,
          }));

        if (!device.gatt) {
          throw new Error(
            "This Bluetooth printer does not expose a BLE GATT connection. Classic Bluetooth SPP printers need a native driver.",
          );
        }

        const server: DirectBluetoothServer = device.gatt.connected
          ? device.gatt
          : await device.gatt.connect();
        const services = await server.getPrimaryServices();
        const characteristics = (
          await Promise.all(
            services.map((service) => service.getCharacteristics()),
          )
        ).flat();
        const writable = characteristics.find(
          (characteristic) =>
            characteristic.properties.writeWithoutResponse ||
            characteristic.properties.write,
        );
        if (!writable) {
          throw new Error("No writable BLE printer characteristic was found.");
        }

        for (let offset = 0; offset < payload.length; offset += 180) {
          await writable.writeValue(payload.slice(offset, offset + 180));
        }
        setToast({
          text: "Receipt sent directly to the Bluetooth printer.",
          tone: "success",
        });
        return;
      }

      throw new Error("Select a USB or Bluetooth printer in Settings first.");
    } catch (error) {
      setToast({
        text:
          error instanceof Error
            ? error.message
            : "Direct printer output failed.",
        tone: "error",
      });
    }
  };

  const handleCloseShift = () => {
    if (!openShift || !currentUser) {
      return;
    }

    const cashSales = appData.sales
      .filter(
        (sale) =>
          sale.paymentMethod === "cash" &&
          sale.saleDate === openShift.businessDate,
      )
      .reduce((sum, sale) => sum + sale.total, 0);

    const expenses = appData.expenses
      .filter((expense) => expense.date === openShift.businessDate)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const allowances = appData.allowances
      .filter((allowance) => allowance.date === openShift.businessDate)
      .reduce((sum, entry) => sum + entry.amount, 0);
    const includeCommissions =
      appData.settings.rolePageAccess[currentUser.role]?.includes(
        "commissions",
      ) || false;
    const includeLdCommissions =
      appData.settings.rolePageAccess[currentUser.role]?.includes(
        "ld-commissions",
      ) || false;
    const commissions = includeCommissions
      ? appData.commissions
          .filter((commission) => commission.date === openShift.businessDate)
          .reduce((sum, entry) => sum + entry.amount, 0)
      : 0;
    const ldCommissions = includeLdCommissions
      ? appData.ldCommissions
          .filter((entry) => entry.date === openShift.businessDate)
          .reduce((sum, entry) => sum + entry.amount, 0)
      : 0;

    const expectedCash =
      openShift.openingCash +
      cashSales -
      expenses -
      allowances -
      commissions -
      ldCommissions;
    const actualEndingCash = toNumber(closeShiftForm.actualEndingCash);
    const variance = actualEndingCash - expectedCash;

    setAppData((previous) => ({
      ...previous,
      shifts: previous.shifts.map((shift) =>
        shift.id === openShift.id
          ? {
              ...shift,
              expectedCash,
              actualEndingCash,
              variance,
              closedAt: new Date().toISOString(),
              status: "closed",
            }
          : shift,
      ),
      auditLogs: [
        {
          id: generateId("audit"),
          userId: currentUser.id,
          action: "End of Shift",
          reference: openShift.id,
          description: `${currentUser.name} closed ${openShift.registerNumber} with variance ${formatCurrency(variance)}`,
          createdAt: new Date().toISOString(),
        },
        ...previous.auditLogs,
      ].slice(0, 120),
    }));

    setActivePage("dashboard");
    setToast({ text: "Shift closed successfully.", tone: "success" });
    setCloseShiftForm({ actualEndingCash: "0", notes: "" });
  };

  const salesSummary = useMemo(() => {
    const today = new Date();
    const todayDate = today.toISOString().slice(0, 10);
    const salesToday = appData.sales.filter(
      (sale) =>
        sale.status !== "void" && sale.saleDate.slice(0, 10) === todayDate,
    );
    const grossSales = salesToday.reduce((sum, sale) => sum + sale.total, 0);
    const netSales = salesToday.reduce(
      (sum, sale) => sum + (sale.total - sale.discount),
      0,
    );
    const transactions = salesToday.length;
    const cashSales = salesToday
      .filter((sale) => sale.paymentMethod === "cash")
      .reduce((sum, sale) => sum + sale.total, 0);
    const cardSales = salesToday
      .filter((sale) => sale.paymentMethod === "card")
      .reduce((sum, sale) => sum + sale.total, 0);
    const eWalletSales = salesToday
      .filter((sale) => sale.paymentMethod === "e-wallet")
      .reduce((sum, sale) => sum + sale.total, 0);
    const expensesTotal = appData.expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const allowancesTotal = appData.allowances.reduce(
      (sum, allowance) => sum + allowance.amount,
      0,
    );
    const commissionTotal = appData.commissions.reduce(
      (sum, commission) => sum + commission.amount,
      0,
    );
    const ldCommissionTotal = appData.ldCommissions.reduce(
      (sum, entry) => sum + entry.amount,
      0,
    );

    return {
      grossSales,
      netSales,
      transactions,
      cashSales,
      cardSales,
      eWalletSales,
      expensesTotal,
      allowancesTotal,
      commissionTotal,
      ldCommissionTotal,
    };
  }, [appData]);

  const dailyTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = date.toISOString().slice(0, 10);
      const total = appData.sales
        .filter(
          (sale) =>
            sale.status !== "void" && sale.saleDate.slice(0, 10) === key,
        )
        .reduce((sum, sale) => sum + sale.total, 0);
      return {
        label: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        value: total,
      };
    });

    return days;
  }, [appData.sales]);

  const renderPage = () => (
    <AppContent
      currentUser={currentUser}
      appData={appData}
      activePage={activePage}
      setActivePage={setActivePage}
      selectedUserId={selectedUserId}
      setSelectedUserId={setSelectedUserId}
      pinInput={pinInput}
      setPinInput={setPinInput}
      onLogin={handleLogin}
      registerLocked={registerLocked}
      setToast={setToast}
      onExportData={handleExportData}
      onImportData={handleImportData}
      onHandleStartDay={handleStartDay}
      onRestock={handleRestock}
      onDeleteProduct={handleDeleteProduct}
      onDeleteEmployee={handleDeleteEmployee}
      onResetSales={handleResetSales}
      onDeleteReport={handleDeleteReport}
      onAddCategory={handleAddCategory}
      shiftForm={shiftForm}
      setShiftForm={setShiftForm}
      openShift={openShift}
      onHandleCloseShift={handleCloseShift}
      closeShiftForm={closeShiftForm}
      setCloseShiftForm={setCloseShiftForm}
      onSetPaymentModalOpen={setPaymentModalOpen}
      paymentModalOpen={paymentModalOpen}
      paymentDraft={paymentDraft}
      setPaymentDraft={setPaymentDraft}
      paymentTotal={paymentTotal}
      calculatedChange={calculatedChange}
      cart={cart}
      setCart={setCart}
      searchTerm={searchTerm}
      setSearchTerm={setSearchTerm}
      selectedCategory={selectedCategory}
      setSelectedCategory={setSelectedCategory}
      productsByCategory={productsByCategory}
      filteredProducts={filteredProducts}
      addItemToCart={addItemToCart}
      updateCartQuantity={updateCartQuantity}
      salesSearchTerm={salesSearchTerm}
      setSalesSearchTerm={setSalesSearchTerm}
      filteredSales={filteredSales}
      setReceiptSale={setReceiptSale}
      recordEditor={recordEditor}
      openRecordEditor={openRecordEditor}
      resetRecordEditor={resetRecordEditor}
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
      currentTime={currentTime}
      salesSummary={salesSummary}
      dailyTrend={dailyTrend}
      lowStockProducts={lowStockProducts}
      recentAuditLogs={recentAuditLogs}
      setAppData={setAppData}
      onToggleTheme={() =>
        setAppData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            theme: prev.settings.theme === "dark" ? "light" : "dark",
          },
        }))
      }
      onConfirmPayment={handleConfirmPayment}
      onVoidSale={handleVoidSale}
      receiptSale={receiptSale}
      onDirectPrint={() => {
        if (receiptSale) {
          void handleDirectPrint(receiptSale);
        }
      }}
      onCloseReceipt={() => setReceiptSale(null)}
      sidebarCollapsed={sidebarCollapsed}
      onToggleSidebar={() => setSidebarCollapsed((value) => !value)}
      onLogout={handleLogout}
    />
  );

  return (
    <>
      {renderPage()}
      <AppToast toast={toast} />
    </>
  );
}

export default App;
