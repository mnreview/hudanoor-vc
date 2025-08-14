export interface AppSettings {
  id: string;
  // ข้อมูลร้าน
  storeName: string;
  websiteName: string;
  storeLogo?: string;
  storeSlogan?: string;
  primaryColor: string;

  // ข้อมูลติดต่อ
  storeAddress?: string;
  storePhone?: string;
  storeEmail?: string;

  // การตั้งค่าฟิลด์ฟอร์ม
  incomeFormFields: FormFieldConfig[];
  expenseFormFields: FormFieldConfig[];

  // ตัวเลือกสำหรับฟิลด์ต่างๆ
  channels: string[]; // ช่องทางขาย
  branches: string[]; // สาขา/แพลตฟอร์ม
  productCategories: string[]; // หมวดหมู่สินค้า
  expenseCategories: string[]; // หมวดหมู่รายจ่าย

  // การตั้งค่าอื่นๆ
  currency: string;
  dateFormat: string;
  defaultSalesTarget: number;

  createdAt: string;
  updatedAt: string;
}

export interface FormFieldConfig {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'textarea' | 'date';
  required: boolean;
  options?: string[]; // สำหรับ select
  placeholder?: string;
  defaultValue?: string;
  order: number;
  isVisible: boolean;
}

export interface UpdateLog {
  id: string;
  version: string;
  date: string;
  title: string;
  description: string;
  type: 'feature' | 'bugfix' | 'improvement' | 'security';
  isImportant: boolean;
  createdAt: string;
}