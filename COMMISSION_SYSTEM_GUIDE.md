# คู่มือระบบคำนวณคอมมิชชั่นจากข้อมูลจริง

## ภาพรวมระบบ

ระบบคอมมิชชั่นใหม่จะคำนวณค่าคอมมิชชั่นจากข้อมูลจริงของพนักงานและยอดขาย โดยไม่ใช้ข้อมูล mock อีกต่อไป

## การทำงานของระบบ

### 1. การตั้งค่าคอมมิชชั่นพนักงาน
- พนักงานแต่ละคนสามารถมีอัตราคอมมิชชั่นที่แตกต่างกันตามสาขา/แพลตฟอร์ม
- รองรับ 2 ช่องทางหลัก:
  - **หน้าร้าน (store)**: สาขาต่างๆ เช่น สาขาหลัก, สาขา 2
  - **ออนไลน์ (online)**: แพลตฟอร์มต่างๆ เช่น Shopee, Lazada, Facebook

### 2. การคำนวณคอมมิชชั่น
ระบบจะคำนวณโดย:
1. ดึงข้อมูลพนักงานและการตั้งค่าคอมมิชชั่น
2. ดึงข้อมูลยอดขายจากแผ่นงาน "รายรับ"
3. จับคู่ยอดขายกับสาขา/แพลตฟอร์มที่พนักงานรับผิดชอบ
4. คำนวณคอมมิชชั่น = ยอดขาย × อัตราคอมมิชชั่น (%)

## ไฟล์ที่เกี่ยวข้อง

### API Endpoints
- `api/commission-reports.js` - API สำหรับสร้างรายงานคอมมิชชั่น
- `api/employees.js` - API จัดการข้อมูลพนักงาน (มีอยู่แล้ว)
- `api/income.js` - API บันทึกรายรับ (มีอยู่แล้ว)

### Frontend Libraries
- `src/lib/vercel-commission-reports.ts` - Functions สำหรับเรียก API คอมมิชชั่น
- `src/hooks/use-commission-reports.ts` - React hooks สำหรับจัดการ state

### Components
- `src/pages/EmployeeManagement.tsx` - หน้าจัดการพนักงานและรายงานคอมมิชชั่น

## วิธีการใช้งาน

### 1. ตั้งค่าคอมมิชชั่นพนักงาน
```typescript
// ตัวอย่างการตั้งค่าคอมมิชชั่น
const branchCommissions = [
  { 
    channel: "store", 
    branchOrPlatform: "สาขาหลัก", 
    commissionRate: 2.5 
  },
  { 
    channel: "online", 
    branchOrPlatform: "Shopee", 
    commissionRate: 3.0 
  }
];
```

### 2. เรียกดูรายงานคอมมิชชั่น
```typescript
import { useCommissionReports } from '@/hooks/use-commission-reports';

// ใช้ใน React Component
const { 
  reports, 
  isLoading, 
  totalCommissions, 
  refetch 
} = useCommissionReports();

// หรือเรียกดูเดือนที่ระบุ
const { reports } = useCommissionReports('2024-12');
```

### 3. API Endpoints

#### GET /api/commission-reports
ดึงรายงานคอมมิชชั่นเดือนปัจจุบัน

#### GET /api/commission-reports?period=YYYY-MM
ดึงรายงานคอมมิชชั่นเดือนที่ระบุ

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "employeeId": "emp_123",
      "employeeName": "สมหญิง ใจดี",
      "period": "2024-12",
      "storeSales": 50000,
      "onlineSales": 30000,
      "storeCommission": 1250,
      "onlineCommission": 900,
      "totalCommission": 2150,
      "salary": 15000,
      "totalEarnings": 17150,
      "branchCommissions": [...]
    }
  ],
  "period": "2024-12",
  "totalEmployees": 2,
  "totalCommissions": 6350
}
```

## การทดสอบระบบ

### 1. ทดสอบ API
```bash
node test-commission-api.js
```

### 2. ทดสอบใน Browser
1. เปิดหน้า Employee Management
2. ไปที่แท็บ "รายงานคอมมิชชั่น"
3. ตรวจสอบว่าข้อมูลแสดงถูกต้อง

## ข้อมูลที่ต้องมีใน Google Sheets

### แผ่นงาน "Employees"
| Column | Field | Description |
|--------|-------|-------------|
| A | ID | รหัสพนักงาน |
| B | Name | ชื่อ-นามสกุล |
| C | Position | ตำแหน่ง |
| D | Email | อีเมล |
| E | Phone | เบอร์โทร |
| F | HireDate | วันที่เริ่มงาน |
| G | Salary | เงินเดือน |
| H | Status | สถานะ (active/inactive) |
| I | BranchCommissions | การตั้งค่าคอมมิชชั่น (JSON) |

### แผ่นงาน "รายรับ"
| Column | Field | Description |
|--------|-------|-------------|
| A | ID | รหัสรายการ |
| B | Date | วันที่ |
| C | Channel | ช่องทาง (store/online) |
| D | BranchOrPlatform | สาขา/แพลตฟอร์ม |
| E | ProductName | ชื่อสินค้า |
| F | ProductCategory | หมวดหมู่สินค้า |
| G | Quantity | จำนวน |
| H | TotalAmount | ยอดรวม |
| I | Note | หมายเหตุ |
| J | CreatedAt | วันที่สร้าง |
| K | UpdatedAt | วันที่อัปเดต |

## ข้อดีของระบบใหม่

1. **ข้อมูลแม่นยำ**: คำนวณจากยอดขายจริง ไม่ใช่ข้อมูล mock
2. **ยืดหยุ่น**: รองรับการตั้งค่าคอมมิชชั่นที่แตกต่างกันตามสาขา/แพลตฟอร์ม
3. **อัตโนมัติ**: คำนวณและอัปเดตแบบเรียลไทม์
4. **ตรวจสอบได้**: สามารถตรวจสอบการคำนวณย้อนหลังได้
5. **รายงานครบถ้วน**: แสดงรายละเอียดทั้งยอดขายและคอมมิชชั่น

## การแก้ไขปัญหา

### ไม่มีข้อมูลคอมมิชชั่น
1. ตรวจสอบว่าพนักงานมีการตั้งค่า `branchCommissions`
2. ตรวจสอบว่ามีข้อมูลยอดขายในแผ่นงาน "รายรับ"
3. ตรวจสอบว่าช่องทางและสาขา/แพลตฟอร์มตรงกัน

### ข้อมูลไม่ถูกต้อง
1. ตรวจสอบรูปแบบ JSON ใน `BranchCommissions`
2. ตรวจสอบการเชื่อมต่อ Google Sheets API
3. ตรวจสอบ environment variables

### Performance
- ระบบจะโหลดข้อมูลทั้งหมดแล้วคำนวณใน memory
- สำหรับข้อมูลจำนวนมาก อาจต้องพิจารณาใช้ pagination หรือ caching