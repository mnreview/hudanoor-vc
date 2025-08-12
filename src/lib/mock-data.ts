
import { Income, Expense } from '@/types';

// Mock data สำหรับร้าน HUDANOOR - เสื้อผ้าแฟชั่นมุสลิม
export const mockIncomeData: Income[] = [
  {
    id: '1',
    date: '2025-08-01T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    product_name: 'เดรสยาวผ้าชีฟอง',
    product_category: 'เดรสยาว',
    quantity: 2,
    amount: 1800,
    note: 'สีดำและสีน้ำเงิน',
    createdAt: '2025-08-01T08:00:00.000Z',
    updatedAt: '2025-08-01T08:00:00.000Z'
  },
  {
    id: '2',
    date: '2025-08-01T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'Shopee',
    product_name: 'ผ้าคลุมลูกไม้',
    product_category: 'ผ้าคลุม',
    quantity: 3,
    amount: 1350,
    note: 'ลายดอกไม้',
    createdAt: '2025-08-01T10:00:00.000Z',
    updatedAt: '2025-08-01T10:00:00.000Z'
  },
  {
    id: '3',
    date: '2025-08-02T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'Lazada',
    product_name: 'มินิเดรสคอเสื้อ',
    product_category: 'มินิเดรส',
    quantity: 4,
    amount: 2400,
    note: 'ไซส์ S-XL',
    createdAt: '2025-08-02T09:00:00.000Z',
    updatedAt: '2025-08-02T09:00:00.000Z'
  },
  {
    id: '4',
    date: '2025-08-02T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'Facebook Shop',
    product_name: 'กระโปรงยาวพลีท',
    product_category: 'กระโปรง',
    quantity: 2,
    amount: 1200,
    note: 'สีครีมและสีเทา',
    createdAt: '2025-08-02T14:00:00.000Z',
    updatedAt: '2025-08-02T14:00:00.000Z'
  },
  {
    id: '5',
    date: '2025-08-03T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    product_name: 'กางเกงขายาวผ้าไหม',
    product_category: 'กางเกง',
    quantity: 1,
    amount: 890,
    note: 'งานสั่งตัด',
    createdAt: '2025-08-03T11:00:00.000Z',
    updatedAt: '2025-08-03T11:00:00.000Z'
  },
  {
    id: '6',
    date: '2025-08-03T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'Instagram Shop',
    product_name: 'เสื้อสั้นแขนพอง',
    product_category: 'เสื้อสั้น',
    quantity: 5,
    amount: 1750,
    note: 'คอลเลคชั่นใหม่',
    createdAt: '2025-08-03T16:00:00.000Z',
    updatedAt: '2025-08-03T16:00:00.000Z'
  },
  {
    id: '7',
    date: '2025-08-04T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    product_name: 'เดรสสั่งตัดผ้าลูกไม้',
    product_category: 'เดรสสั่งตัด',
    quantity: 1,
    amount: 2500,
    note: 'งานพิเศษ',
    createdAt: '2025-08-04T10:00:00.000Z',
    updatedAt: '2025-08-04T10:00:00.000Z'
  }
];

export const mockExpenseData: Expense[] = [
  {
    id: '1',
    date: '2025-08-01T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    expense_item: 'ผ้าชีฟองแก้ว',
    expense_category: 'วัตถุดิบ/ผ้า',
    cost: 800,
    note: 'สำหรับเดรสยาว',
    createdAt: '2025-08-01T07:00:00.000Z',
    updatedAt: '2025-08-01T07:00:00.000Z'
  },
  {
    id: '2',
    date: '2025-08-01T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'ขนส่งทั่วไป',
    expense_item: 'ค่าจัดส่งสินค้า',
    expense_category: 'โลจิสติกส์',
    cost: 120,
    note: 'ค่าส่งออนไลน์',
    createdAt: '2025-08-01T12:00:00.000Z',
    updatedAt: '2025-08-01T12:00:00.000Z'
  },
  {
    id: '3',
    date: '2025-08-02T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    expense_item: 'ค่าตัดเย็บ',
    expense_category: 'ค่าตัด/จักร',
    cost: 450,
    note: 'ค่าแรงช่างตัด',
    createdAt: '2025-08-02T08:00:00.000Z',
    updatedAt: '2025-08-02T08:00:00.000Z'
  },
  {
    id: '4',
    date: '2025-08-02T00:00:00.000Z',
    channel: 'store',
    branch_or_platform: 'สาขาหลัก',
    expense_item: 'ค่าไฟฟ้า',
    expense_category: 'สาธารณูปโภค',
    cost: 650,
    note: 'ค่าไฟเดือนกรกฎาคม',
    createdAt: '2025-08-02T15:00:00.000Z',
    updatedAt: '2025-08-02T15:00:00.000Z'
  },
  {
    id: '5',
    date: '2025-08-03T00:00:00.000Z',
    channel: 'online',
    branch_or_platform: 'Facebook Ads',
    expense_item: 'โฆษณาออนไลน์',
    expense_category: 'การตลาด',
    cost: 300,
    note: 'โปรโมทเดรสใหม่',
    createdAt: '2025-08-03T13:00:00.000Z',
    updatedAt: '2025-08-03T13:00:00.000Z'
  }
];
