
export type Channel = 'store' | 'online';

export interface BaseRecord {
  id: string;
  date: string; // ISO 8601
  channel: Channel;
  branch_or_platform: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Income extends BaseRecord {
  product_name: string;
  product_category: string;
  quantity: number;
  amount: number;
}

export interface Expense extends BaseRecord {
  expense_item: string;
  expense_category: string;
  cost: number;
}

export interface DashboardSummary {
  totalIncome: number;
  totalExpense: number;
  profit: number;
  totalQuantity: number;
  salesTarget?: number;
  targetProgress?: number;
  periodComparison?: {
    incomeChange: number;
    expenseChange: number;
    profitChange: number;
  };
}

export interface ChartData {
  date: string;
  income: number;
  expense: number;
  profit: number;
}

export interface CategoryData {
  name: string;
  value: number;
  percentage: number;
}

export interface ChannelData {
  channel: string;
  income: number;
  expense: number;
  quantity: number;
}

export interface FilterOptions {
  dateFrom?: string;
  dateTo?: string;
  channels?: Channel[];
  branches?: string[];
  productCategories?: string[];
  expenseCategories?: string[];
  q?: string;
}

export interface TopCategoryData {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

// Re-export types from other files
export * from './employee';
export * from './settings';
export * from './task';
