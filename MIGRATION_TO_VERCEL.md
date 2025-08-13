# การย้ายจาก Google Apps Script ไป Vercel

## ภาพรวมการเปลี่ยนแปลง

### ปัจจุบัน (Google Apps Script)
- ใช้ Google Apps Script เป็น backend
- เก็บข้อมูลใน Google Sheets
- Deploy ผ่าน Google Apps Script Web App

### เป้าหมาย (Vercel)
- ใช้ Vercel เป็น hosting platform
- ยังคงใช้ Google Sheets เป็น database
- ใช้ Vercel Serverless Functions สำหรับ API

## ขั้นตอนการย้าย

### 1. เตรียมโปรเจค React
```bash
# โปรเจคพร้อมแล้ว - ไม่ต้องทำอะไร
npm install
npm run build
```

### 2. ตั้งค่า Vercel
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# Login เข้า Vercel
vercel login

# Deploy โปรเจค
vercel
```

### 3. ตั้งค่า Environment Variables ใน Vercel
ใน Vercel Dashboard > Settings > Environment Variables:

```
VITE_GOOGLE_SHEETS_API_KEY=your_api_key
VITE_GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id
VITE_GOOGLE_CLIENT_ID=your_client_id
VITE_GOOGLE_CLIENT_SECRET=your_client_secret
```

### 4. สร้าง API Routes สำหรับ Vercel

#### 4.1 สร้างโฟลเดอร์ API
```
api/
├── sheets/
│   ├── read.js
│   ├── write.js
│   └── update.js
└── auth/
    └── google.js
```

#### 4.2 ตัวอย่าง API Route สำหรับอ่านข้อมูล
```javascript
// api/sheets/read.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
      range: req.query.range || 'Sheet1!A:Z',
    });

    res.status(200).json({ data: response.data.values });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

### 5. อัพเดท Frontend Code

#### 5.1 เปลี่ยน API endpoints
```typescript
// src/lib/google-sheets.ts
const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app/api' 
  : '/api';

export const fetchSheetData = async (range: string) => {
  const response = await fetch(`${API_BASE}/sheets/read?range=${range}`);
  return response.json();
};
```

### 6. ตั้งค่า Google Cloud Console

#### 6.1 สร้าง Service Account
1. ไปที่ Google Cloud Console
2. สร้าง Service Account ใหม่
3. Download JSON key file
4. เพิ่ม Service Account email ใน Google Sheets (Share)

#### 6.2 Enable APIs
- Google Sheets API
- Google Drive API (ถ้าจำเป็น)

### 7. ตั้งค่า vercel.json
```json
{
  "functions": {
    "api/**/*.js": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/api/$1"
    }
  ]
}
```

## การทดสอบ

### 1. ทดสอบ Local
```bash
# ติดตั้ง Vercel CLI
npm install -g vercel

# รัน local development
vercel dev
```

### 2. ทดสอบ Production
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## ข้อดีของการใช้ Vercel

### Performance
- ✅ Global CDN
- ✅ Automatic optimization
- ✅ Fast cold starts

### Developer Experience
- ✅ Git integration
- ✅ Preview deployments
- ✅ Easy rollbacks

### Scalability
- ✅ Serverless functions
- ✅ Automatic scaling
- ✅ No server management

## ข้อควรระวัง

### 1. Rate Limits
- Google Sheets API มี rate limits
- ใช้ caching เมื่อเป็นไปได้

### 2. Cold Starts
- Serverless functions อาจมี cold start delay
- พิจารณาใช้ keep-alive strategies

### 3. Environment Variables
- ตรวจสอบให้แน่ใจว่าตั้งค่าครบถ้วน
- ใช้ Vercel CLI สำหรับ local development

## ขั้นตอนถัดไป

1. ✅ โปรเจค React พร้อมแล้ว
2. ⏳ สร้าง API routes
3. ⏳ ตั้งค่า Google Service Account
4. ⏳ Deploy ไป Vercel
5. ⏳ ทดสอบ functionality
6. ⏳ ตั้งค่า custom domain (ถ้าต้องการ)

## การสนับสนุน

หากมีปัญหาในการย้าย สามารถ:
1. ตรวจสอบ Vercel logs
2. ใช้ `vercel dev` สำหรับ debugging
3. ตรวจสอบ Google Cloud Console logs