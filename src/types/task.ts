export interface TaskReminder {
  id: string;
  title: string;
  type: 'income' | 'expense';
  amount: number;
  note: string;
  dueDate: Date;
  completed: boolean;
  createdAt: Date;
}