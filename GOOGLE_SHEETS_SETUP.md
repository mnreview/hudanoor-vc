# การตั้งค่า Google Apps Script สำหรับ HUDANOOR

## ขั้นตอนที่ 1: สร้าง Google Sheets

1. ไปที่ [Google Sheets](https://sheets.google.com)
2. สร้าง Spreadsheet ใหม่
3. ตั้งชื่อว่า "HUDANOOR - ระบบบันทึกรายรับรายจ่าย"
4. คัดลอก Spreadsheet ID จาก URL (ส่วนระหว่าง `/d/` และ `/edit`)

## ขั้นตอนที่ 2: สร้าง Google Apps Script

1. ไปที่ [Google Apps Script](https://script.google.com)
2. คลิก "New Project"
3. ลบโค้ดเดิมทั้งหมด (function myFunction() {...})
4. คัดลอกโค้ดจากไฟล์ `google-apps-script.js` ในโปรเจคนี้
5. **สำคัญ**: แก้ไขบรรทัดที่ 5:
   ```javascript
   var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
   ```
   เป็น:
   ```javascript
   var SPREADSHEET_ID = 'ใส่_SPREADSHEET_ID_ของคุณ_ที่นี่';
   ```
6. บันทึกโปรเจค (Ctrl+S) และตั้งชื่อ "HUDANOOR API"

## ขั้นตอนที่ 3: Deploy Web App

1. คลิก "Deploy" > "New deployment"
2. เลือก type เป็น "Web app"
3. ตั้งค่า:
   - **Description**: "HUDANOOR API v1"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone"
4. คลิก "Deploy"
5. คัดลอก Web App URL ที่ได้

## ขั้นตอนที่ 4: ตั้งค่า Environment Variables

1. เปิดไฟล์ `.env` ในโปรเจค
2. ใส่ Web App URL:
```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

## ขั้นตอนที่ 5: ทดสอบการเชื่อมต่อ

1. รันโปรเจค: `npm run dev`
2. เปิดเว็บไซต์
3. คลิกปุ่ม "ตั้งค่า Headers ใน Google Sheets"
4. ตรวจสอบใน Google Sheets ว่ามี headers แล้ว
5. ลองเพิ่มข้อมูลใหม่เพื่อทดสอบ

## ข้อดีของ Google Apps Script

✅ **ไม่ต้องใช้ API Key** - ใช้ OAuth2 อัตโนมัติ
✅ **เขียนข้อมูลได้** - ไม่มีข้อจำกัดเรื่อง permissions
✅ **ฟรี** - ไม่มีค่าใช้จ่าย
✅ **ปลอดภัย** - ทำงานบน Google Cloud
✅ **ง่าย** - ไม่ต้องตั้งค่า authentication ซับซ้อน

## การแก้ไขปัญหา

### ปัญหา: Web App ไม่ทำงาน
- ตรวจสอบว่า Deploy แล้วและเลือก "Anyone" ใน permissions
- ลองเข้า Web App URL ใน browser ดูว่าได้ response หรือไม่
- ตรวจสอบ SPREADSHEET_ID ใน Apps Script ให้ถูกต้อง

### ปัญหา: ไม่สามารถเพิ่มข้อมูลได้
- ตรวจสอบว่า Sheets มี headers แล้ว
- ลองรัน initializeSheets() ใน Apps Script Editor
- ตรวจสอบ Console ใน browser ว่ามี error อะไร

### ปัญหา: CORS Error
- **สำคัญ**: ต้อง Deploy Apps Script ใหม่หลังแก้ไขโค้ด
- ตรวจสอบว่าเลือก "Anyone" ใน permissions
- ลองเข้า Web App URL ใน browser ดูว่าทำงานหรือไม่

### ปัญหา: Failed to fetch
- ตรวจสอบ Web App URL ให้ถูกต้อง
- ตรวจสอบว่า Deploy เป็น "New deployment" แล้ว
- ลอง Deploy ใหม่และใช้ URL ใหม่

## การอัปเดต Apps Script

เมื่อต้องการแก้ไขโค้ด:
1. แก้ไขโค้ดใน Apps Script Editor
2. บันทึก (Ctrl+S)
3. Deploy > "Manage deployments"
4. คลิก Edit (ไอคอนดินสอ)
5. เปลี่ยน Version เป็น "New version"
6. คลิก "Deploy"

## หมายเหตุความปลอดภัย

1. Web App URL ไม่ควร share ให้คนอื่น
2. ตรวจสอบ Apps Script execution log เป็นประจำ
3. สำหรับ Production ควรเปลี่ยน permissions เป็น "Anyone with Google account"
## ต
ัวอย่างการตั้งค่า

### ตัวอย่าง Spreadsheet ID
หาก URL ของ Google Sheets คือ:
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
```

ดังนั้น SPREADSHEET_ID คือ: `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### ตัวอย่าง Web App URL
หลัง Deploy แล้ว คุณจะได้ URL แบบนี้:
```
https://script.google.com/macros/s/AKfycbxyz123.../exec
```

### ตัวอย่างไฟล์ .env
```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxyz123.../exec
```

## เช็คลิสต์การตั้งค่า

- [ ] สร้าง Google Sheets แล้ว
- [ ] คัดลอก Spreadsheet ID แล้ว
- [ ] สร้าง Google Apps Script แล้ว
- [ ] แก้ไข SPREADSHEET_ID ใน Apps Script แล้ว
- [ ] Deploy เป็น Web App แล้ว
- [ ] คัดลอก Web App URL แล้ว
- [ ] ใส่ URL ในไฟล์ .env แล้ว
- [ ] ทดสอบการเชื่อมต่อแล้ว