export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  storeCommission: number; // เปอร์เซ็นต์คอมหน้าร้าน
  onlineCommission: number; // เปอร์เซ็นต์คอมออนไลน์
  startDate: string;
  isActive: boolean;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCommissionReport {
  employeeId: string;
  employeeName: string;
  period: string;
  storeSales: number;
  onlineSales: number;
  storeCommission: number;
  onlineCommission: number;
  totalCommission: number;
  salary: number;
  totalEarnings: number;
}