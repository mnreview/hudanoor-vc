# HUDANOOR - ระบบบันทึกรายรับรายจ่าย

ระบบบันทึกรายรับ-รายจ่ายสำหรับร้าน HUDANOOR เสื้อผ้าแฟชั่นมุสลิม

## ✨ Features

- 📊 **Dashboard แบบ Real-time** - แสดงสรุปรายรับ-รายจ่าย พร้อมกราฟและตาราง
- 💰 **บันทึกรายรับ** - บันทึกการขายสินค้าตามช่องทางต่างๆ
- 💸 **บันทึกรายจ่าย** - บันทึกค่าใช้จ่ายต่างๆ ของร้าน
- 📈 **กราฟและสถิติ** - แสดงแนวโน้มการขาย สัดส่วนตามหมวดหมู่
- 🎯 **เป้าหมายการขาย** - ตั้งเป้าหมายและติดตามความคืบหน้า
- 📱 **Responsive Design** - ใช้งานได้ทั้งมือถือและคอมพิวเตอร์
- 🌙 **Dark/Light Mode** - เปลี่ยนธีมได้ตามต้องการ
- ☁️ **Google Sheets Integration** - เก็บข้อมูลใน Google Sheets

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Database**: Google Sheets (via Google Apps Script)
- **Icons**: Lucide React

## 🚀 Quick Start

### 1. Clone และติดตั้ง Dependencies

```bash
git clone https://github.com/your-username/hudanoor-system.git
cd hudanoor-system
npm install
```

### 2. ตั้งค่า Google Sheets

1. ทำตามคำแนะนำใน [GOOGLE_SHEETS_SETUP.md](./GOOGLE_SHEETS_SETUP.md)
2. คัดลอก `.env.example` เป็น `.env`
3. ใส่ Google Apps Script URL ในไฟล์ `.env`

```env
VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### 3. รันโปรเจค

```bash
npm run dev
```

เปิด [http://localhost:5173](http://localhost:5173) ในเบราว์เซอร์

## 📋 การใช้งาน

### บันทึกรายรับ
- เลือกช่องทางขาย: หน้าร้าน (Lotus Yala, ตลาดใหม่) หรือ ออนไลน์ (Tiktok, Facebook, Shopee)
- ระบุสินค้า: ชื่อสินค้า, หมวดหมู่ (มินิเดรส, เดรสยาว, ผ้าคลุม, กระโปรง, กางเกง, เสื้อสั้น)
- ใส่จำนวนและราคา

### บันทึกรายจ่าย
- เลือกช่องทางและสาขา/แพลตฟอร์ม
- ระบุรายการค่าใช้จ่ายและหมวดหมู่
- ใส่จำนวนเงิน

### ดูสถิติ
- สรุปรายรับ-รายจ่าย-กำไร
- กราฟแนวโน้มรายวัน
- สัดส่วนตามหมวดหมู่และช่องทาง
- Top 5 หมวดหมู่ที่ขายดี

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── dashboard/      # Dashboard components
│   ├── forms/          # Form components
│   ├── providers/      # Context providers
│   └── ui/            # UI components (shadcn/ui)
├── hooks/             # Custom React hooks
├── lib/               # Utility functions
├── pages/             # Page components
└── types/             # TypeScript type definitions
```

## 🔧 Scripts

```bash
npm run dev          # รัน development server
npm run build        # Build สำหรับ production
npm run preview      # Preview production build
npm run lint         # รัน ESLint
```

## 📊 Google Sheets Structure

### Sheet "รายรับ"
| ID | วันที่ | ช่องทาง | สาขา/แพลตฟอร์ม | ชื่อสินค้า | หมวดหมู่สินค้า | จำนวน | ยอดเงิน | หมายเหตุ | สร้างเมื่อ | แก้ไขเมื่อ |

### Sheet "รายจ่าย"
| ID | วันที่ | ช่องทาง | สาขา/แพลตฟอร์ม | รายการค่าใช้จ่าย | หมวดหมู่ค่าใช้จ่าย | ยอดเงิน | หมายเหตุ | สร้างเมื่อ | แก้ไขเมื่อ |

## 🚀 Deployment

### Deploy ด้วย Vercel (แนะนำ)
1. ไปที่ [vercel.com](https://vercel.com)
2. เชื่อมต่อกับ GitHub repository นี้
3. ตั้งค่า Environment Variable: `VITE_GOOGLE_APPS_SCRIPT_URL`
4. Deploy อัตโนมัติ!

### Deploy ด้วย Netlify
1. ไปที่ [netlify.com](https://netlify.com)
2. เลือก "New site from Git"
3. เชื่อมต่อ repository และตั้งค่า Environment Variables
4. Deploy!

### Deploy ด้วย GitHub Pages
1. ไปที่ Settings > Pages ใน GitHub repository
2. เลือก "GitHub Actions" เป็น source
3. เพิ่ม Secret: `VITE_GOOGLE_APPS_SCRIPT_URL`
4. Push code เพื่อ trigger deployment

## 🤝 Contributing

1. Fork โปรเจค
2. สร้าง feature branch (`git checkout -b feature/amazing-feature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add amazing feature'`)
4. Push ไปยัง branch (`git push origin feature/amazing-feature`)
5. เปิด Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) สำหรับ UI components
- [Tailwind CSS](https://tailwindcss.com/) สำหรับ styling
- [Recharts](https://recharts.org/) สำหรับ charts
- [Lucide](https://lucide.dev/) สำหรับ icons