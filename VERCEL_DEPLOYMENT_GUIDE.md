# คู่มือการ Deploy ไป Vercel

## ขั้นตอนที่ 1: เตรียม Google Service Account

### 1.1 สร้าง Google Cloud Project
1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้าง Project ใหม่หรือเลือก Project ที่มีอยู่
3. Enable Google Sheets API:
   - ไปที่ "APIs & Services" > "Library"
   - ค้นหา "Google Sheets API"
   - คลิก "Enable"

### 1.2 สร้าง Service Account
1. ไปที่ "APIs & Services" > "Credentials"
2. คลิก "Create Credentials" > "Service Account"
3. ใส่ชื่อ Service Account (เช่น "vercel-sheets-api")
4. คลิก "Create and Continue"
5. เลือก Role: "Editor" หรือ "Google Sheets API" specific roles
6. คลิก "Done"

### 1.3 สร้าง Key สำหรับ Service Account
1. คลิกที่ Service Account ที่สร้างไว้
2. ไปที่ tab "Keys"
3. คลิก "Add Key" > "Create new key"
4. เลือก "JSON" format
5. Download ไฟล์ JSON (เก็บไว้ให้ปลอดภัย!)

### 1.4 Share Google Sheets กับ Service Account
1. เปิด Google Sheets ที่ต้องการใช้
2. คลิก "Share" 
3. เพิ่ม email ของ Service Account (จากไฟล์ JSON: `client_email`)
4. ให้สิทธิ์ "Editor"

## ขั้นตอนที่ 2: Deploy ไป Vercel

### 2.1 ติดตั้ง Vercel CLI
```bash
npm install -g vercel
```

### 2.2 Login เข้า Vercel
```bash
vercel login
```

### 2.3 ติดตั้ง Dependencies
```bash
npm install googleapis
```

### 2.4 Deploy โปรเจค
```bash
# Deploy ครั้งแรก
vercel

# หรือ Deploy to production
vercel --prod
```

## ขั้นตอนที่ 3: ตั้งค่า Environment Variables

### 3.1 ผ่าน Vercel Dashboard
1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. เลือกโปรเจคของคุณ
3. ไปที่ "Settings" > "Environment Variables"
4. เพิ่มตัวแปรต่อไปนี้:

```
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

### 3.2 ผ่าน Vercel CLI
```bash
# ตั้งค่าทีละตัว
vercel env add GOOGLE_CLIENT_EMAIL
vercel env add GOOGLE_PRIVATE_KEY
vercel env add GOOGLE_SHEETS_SPREADSHEET_ID

# หรือใช้ไฟล์ .env
vercel env pull .env.local
```

### 3.3 หา Spreadsheet ID
จาก URL ของ Google Sheets:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```
Spreadsheet ID คือ: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

## ขั้นตอนที่ 4: ทดสอบ

### 4.1 ทดสอบ API Health
```bash
curl https://your-app.vercel.app/api/health
```

### 4.2 ทดสอบการอ่านข้อมูล
```bash
curl "https://your-app.vercel.app/api/sheets/read?range=รายรับ!A:K"
```

### 4.3 ทดสอบการเขียนข้อมูล
```bash
curl -X POST https://your-app.vercel.app/api/sheets/write \
  -H "Content-Type: application/json" \
  -d '{
    "range": "รายรับ!A:K",
    "values": [["test_id", "2024-01-01", "online", "test", "product", "category", 1, 100, "test note", "2024-01-01", "2024-01-01"]]
  }'
```

## ขั้นตอนที่ 5: อัพเดทโค้ดให้ใช้ Vercel API

### 5.1 เปลี่ยน Import ใน Components
```typescript
// เปลี่ยนจาก
import { getIncomeData, getExpenseData } from '@/lib/google-sheets';

// เป็น
import { getIncomeData, getExpenseData } from '@/lib/vercel-sheets';
```

### 5.2 อัพเดท Hook ที่ใช้ Google Sheets
ไฟล์ที่ต้องอัพเดท:
- `src/hooks/use-sheets-data.ts`
- `src/components/forms/add-record-form.tsx`
- Components อื่นๆ ที่เรียกใช้ Google Sheets functions

## การแก้ไขปัญหาที่พบบ่อย

### 1. Error: "Failed to read sheet data"
- ตรวจสอบ Environment Variables
- ตรวจสอบว่า Service Account มีสิทธิ์เข้าถึง Sheets
- ตรวจสอบ Spreadsheet ID

### 2. Error: "Method not allowed"
- ตรวจสอบ HTTP method ที่ใช้
- ตรวจสอบ API route path

### 3. CORS Error
- API routes มี CORS headers แล้ว
- ตรวจสอบ domain ที่เรียก API

### 4. Cold Start Delay
- Serverless functions อาจมี delay ครั้งแรก
- พิจารณาใช้ warming strategies

## การ Monitor และ Debug

### 1. Vercel Logs
```bash
vercel logs
```

### 2. Function Logs
- ไปที่ Vercel Dashboard > Functions
- ดู logs ของแต่ละ function

### 3. Google Cloud Logs
- ไปที่ Google Cloud Console > Logging
- ดู API usage และ errors

## การอัพเดทและ Maintenance

### 1. อัพเดทโค้ด
```bash
git add .
git commit -m "Update code"
git push origin main
# Vercel จะ auto-deploy
```

### 2. อัพเดท Environment Variables
```bash
vercel env rm VARIABLE_NAME
vercel env add VARIABLE_NAME
```

### 3. Rollback
```bash
vercel rollback [deployment-url]
```

## Performance Tips

1. **Caching**: พิจารณาใช้ caching สำหรับข้อมูลที่ไม่เปลี่ยนแปลงบ่อย
2. **Batch Operations**: รวม API calls เมื่อเป็นไปได้
3. **Error Handling**: จัดการ errors อย่างเหมาะสม
4. **Rate Limiting**: ระวัง Google Sheets API rate limits

## Security Best Practices

1. **Environment Variables**: ไม่เก็บ secrets ใน code
2. **CORS**: ตั้งค่า CORS ให้เหมาะสม
3. **Input Validation**: validate ข้อมูลที่รับเข้ามา
4. **Service Account**: ให้สิทธิ์เฉพาะที่จำเป็น

---

หากมีปัญหาหรือข้อสงสัย สามารถตรวจสอบ:
- [Vercel Documentation](https://vercel.com/docs)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Google Cloud Console](https://console.cloud.google.com/)