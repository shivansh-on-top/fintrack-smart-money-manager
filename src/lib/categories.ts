// Transaction categories with icons & colors used across the app
import {
  UtensilsCrossed, Car, ShoppingBag, Receipt, Film,
  Wallet, Briefcase, TrendingUp, MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

export type CategoryKey =
  | "Food" | "Transport" | "Shopping" | "Bills" | "Entertainment"
  | "Salary" | "Freelance" | "Investment" | "Other";

export interface CategoryMeta {
  key: CategoryKey;
  icon: LucideIcon;
  color: string; // tailwind color class
  type: "income" | "expense" | "both";
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "Food", icon: UtensilsCrossed, color: "text-orange-500", type: "expense" },
  { key: "Transport", icon: Car, color: "text-blue-500", type: "expense" },
  { key: "Shopping", icon: ShoppingBag, color: "text-pink-500", type: "expense" },
  { key: "Bills", icon: Receipt, color: "text-red-500", type: "expense" },
  { key: "Entertainment", icon: Film, color: "text-purple-500", type: "expense" },
  { key: "Salary", icon: Wallet, color: "text-emerald-500", type: "income" },
  { key: "Freelance", icon: Briefcase, color: "text-teal-500", type: "income" },
  { key: "Investment", icon: TrendingUp, color: "text-cyan-500", type: "income" },
  { key: "Other", icon: MoreHorizontal, color: "text-slate-500", type: "both" },
];

export const EXPENSE_CATEGORIES = CATEGORIES.filter((c) => c.type !== "income");
export const INCOME_CATEGORIES = CATEGORIES.filter((c) => c.type !== "expense");

export function getCategoryMeta(key: string): CategoryMeta {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
