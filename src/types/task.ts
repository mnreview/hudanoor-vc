export interface TaskReminder {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
  // Additional fields for complete record
  productCategory?: string;
  expenseCategory?: string;
  channel?: 'store' | 'online';
  branchOrPlatform?: string;
}