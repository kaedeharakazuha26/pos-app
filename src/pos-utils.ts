import type { PageId, Role } from "./types";

export const navItems: { id: PageId; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "▣" },
  { id: "start-day", label: "Start of Day", icon: "◔" },
  { id: "pos", label: "POS / Register", icon: "◫" },
  { id: "end-shift", label: "End of Shift", icon: "✓" },
  { id: "sales-history", label: "Sales History", icon: "🗂" },
  { id: "products", label: "Products", icon: "▤" },
  { id: "inventory", label: "Inventory", icon: "▥" },
  { id: "employees", label: "Employees", icon: "👤" },
  { id: "expenses", label: "Expenses", icon: "💸" },
  { id: "allowances", label: "Allowance", icon: "🎁" },
  { id: "commissions", label: "Commission", icon: "📈" },
  { id: "ld-commissions", label: "LD Commission", icon: "📊" },
  { id: "reports", label: "Reports", icon: "📋" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export const pageAccess: Record<PageId, Role[]> = {
  dashboard: ["Administrator", "Cashier", "Staff"],
  "start-day": ["Administrator", "Cashier"],
  pos: ["Administrator", "Cashier"],
  "end-shift": ["Administrator", "Cashier"],
  "sales-history": ["Administrator", "Cashier", "Staff"],
  products: ["Administrator", "Cashier"],
  inventory: ["Administrator", "Cashier"],
  employees: ["Administrator"],
  expenses: ["Administrator", "Cashier"],
  allowances: ["Administrator", "Cashier"],
  commissions: ["Administrator", "Cashier"],
  "ld-commissions": ["Administrator", "Cashier"],
  reports: ["Administrator", "Cashier"],
  settings: ["Administrator"],
};

export const hashPin = (pin: string) =>
  String(
    Array.from(pin).reduce(
      (value, char) => (value * 31 + char.charCodeAt(0)) >>> 0,
      0,
    ),
  );

let activeCurrency = "USD";

export const setActiveCurrency = (currency: string) => {
  activeCurrency = currency;
};

export const formatCurrency = (value: number, selectedCurrency?: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedCurrency || activeCurrency,
  }).format(value);

export const generateId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;

export const toNumber = (value: string | number) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const getBusinessDate = () => new Date().toISOString().slice(0, 10);

export const getAllowedPages = (
  role?: Role,
  rolePageAccess?: Record<Role, PageId[]>,
): PageId[] => {
  if (!role) {
    return [];
  }

  return navItems
    .filter((item) =>
      rolePageAccess
        ? rolePageAccess[role].includes(item.id)
        : pageAccess[item.id].includes(role),
    )
    .map((item) => item.id);
};

export const getPageTitle = (page: PageId) =>
  navItems.find((item) => item.id === page)?.label || "Dashboard";
