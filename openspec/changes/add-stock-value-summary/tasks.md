## 1. Backend
- [x] 1.1 เพิ่ม `view=lots` ใน `api/stock.js` (per-lot `qty_sold` / `remaining` + เกลี่ยยอดขายที่ไม่ผูกล็อตแบบ FIFO)

## 2. Frontend
- [x] 2.1 เพิ่ม `StockLotItem` + `getStockLots()` ใน `src/lib/stock-api.ts`
- [x] 2.2 สร้างหน้า `src/pages/StockValue.tsx` (การ์ดสรุป, ตัวกรองล็อต, ค้นหา, กราฟ, ตารางรายล็อตแบบขยายได้)
- [x] 2.3 ต่อ route `/stock-value` ใน `src/components/layout/main-layout.tsx`
- [x] 2.4 เพิ่มเมนู "สรุปมูลค่าสต๊อก" ใน `src/components/layout/sidebar.tsx`
- [x] 2.5 เพิ่ม `stock-value` ใน `MENU_OPTIONS` ของ `src/components/employees/employee-accounts.tsx`

## 3. ตรวจสอบ
- [x] 3.1 `npm run build` ผ่าน (TypeScript + Vite)
- [x] 3.2 ตรวจว่าผลรวม "คงเหลือ" ของทุกล็อตตรงกับหน้า `/stock-inventory` (per-lot remaining มาจาก `stock_in_id` + เกลี่ย FIFO จึงรวมได้เท่ากับ `view=inventory`)
