export interface BranchCommission {
  branchOrPlatform: string;
  commissionRate: number;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  branchCommissions: BranchCommission[]; // ค่าคอมตามสาขา/แพลตฟอร์ม
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