"use client";

import { Fragment, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import {
  CircleDollarSign, Coins, Boxes, TrendingUp, Search, Layers,
  ChevronDown, ChevronRight, AlertTriangle, Eye, EyeOff, X
} from "lucide-react";
import { getStockLots, StockLotItem } from "@/lib/stock-api";
import { formatDate } from "@/lib/utils";

const baht = (n: number) => `฿${Math.round(n).toLocaleString('th-TH')}`;
const num = (n: number) => n.toLocaleString('th-TH');

interface LotGroup {
  date: string;
  items: StockLotItem[];
  visibleItems: StockLotItem[];
  totalIn: number;
  totalSold: number;
  remaining: number;
  costValue: number;
  revenueValue: number;
  profit: number;
}

export function StockValue() {
  const { data: lots = [], isLoading } = useQuery({
    queryKey: ['stock', { view: 'lots' }],
    queryFn: getStockLots,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false
  });

  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [hideSoldOut, setHideSoldOut] = useState(true);
  const [expanded, setExpanded] = useState<string[]>([]);

  // ล็อตทั้งหมดที่มี (ใช้ในตัวกรอง — ไม่ขึ้นกับคำค้น เพื่อให้เลือกล็อตได้เสมอ)
  const lotOptions = useMemo(() => {
    const map = new Map<string, { date: string; items: number; remaining: number }>();
    for (const item of lots) {
      const cur = map.get(item.date) ?? { date: item.date, items: 0, remaining: 0 };
      cur.items += 1;
      cur.remaining += Number(item.remaining);
      map.set(item.date, cur);
    }
    return [...map.values()].sort((a, b) => b.date.localeCompare(a.date));
  }, [lots]);

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lots.filter(item => {
      const matchLot = selectedDates.length === 0 || selectedDates.includes(item.date);
      const matchSearch = !q || [item.sku, item.product_name, item.color, item.size, item.product_category]
        .some(v => v?.toLowerCase().includes(q));
      return matchLot && matchSearch;
    });
  }, [lots, selectedDates, search]);

  const stats = useMemo(() => {
    let remaining = 0, costValue = 0, revenueValue = 0, noPriceItems = 0, noPriceQty = 0;
    for (const item of filteredItems) {
      const left = Number(item.remaining);
      if (left <= 0) continue;
      remaining += left;
      costValue += left * Number(item.cost_price);
      revenueValue += left * Number(item.sell_price);
      if (Number(item.sell_price) <= 0) {
        noPriceItems += 1;
        noPriceQty += left;
      }
    }
    const profit = revenueValue - costValue;
    const marginPct = revenueValue > 0 ? (profit / revenueValue) * 100 : 0;
    return { remaining, costValue, revenueValue, profit, marginPct, noPriceItems, noPriceQty };
  }, [filteredItems]);

  const groups = useMemo<LotGroup[]>(() => {
    const map = new Map<string, StockLotItem[]>();
    for (const item of filteredItems) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }

    return [...map.entries()]
      .map(([date, items]) => {
        const sorted = [...items].sort((a, b) =>
          Number(b.remaining) * Number(b.sell_price) - Number(a.remaining) * Number(a.sell_price)
        );
        const group: LotGroup = {
          date,
          items: sorted,
          visibleItems: hideSoldOut ? sorted.filter(i => Number(i.remaining) > 0) : sorted,
          totalIn: 0, totalSold: 0, remaining: 0, costValue: 0, revenueValue: 0, profit: 0
        };
        for (const item of sorted) {
          const left = Math.max(Number(item.remaining), 0);
          group.totalIn += Number(item.quantity);
          group.totalSold += Number(item.qty_sold);
          group.remaining += left;
          group.costValue += left * Number(item.cost_price);
          group.revenueValue += left * Number(item.sell_price);
        }
        group.profit = group.revenueValue - group.costValue;
        return group;
      })
      .filter(g => !hideSoldOut || g.remaining > 0)
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredItems, hideSoldOut]);

  const chartData = useMemo(() => {
    return [...groups]
      .filter(g => g.revenueValue > 0)
      .sort((a, b) => b.revenueValue - a.revenueValue)
      .slice(0, 10)
      .map(g => ({
        name: formatDate(g.date).slice(0, 5),
        date: g.date,
        revenue: Math.round(g.revenueValue),
        cost: Math.round(g.costValue)
      }));
  }, [groups]);

  const toggleLot = (date: string) => {
    setSelectedDates(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const toggleExpand = (date: string) => {
    setExpanded(prev => prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]);
  };

  const hasFilter = selectedDates.length > 0 || search.trim() !== "";
  const lotLabel =
    selectedDates.length === 0 ? "ทุกล็อต"
      : selectedDates.length === 1 ? `ล็อต ${formatDate(selectedDates[0])}`
        : `เลือก ${selectedDates.length} ล็อต`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CircleDollarSign className="h-6 w-6 text-rose-500" />
          สรุปมูลค่าสต๊อก
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          ของที่เหลืออยู่ ถ้าขายหมดจะได้เงินเท่าไหร่ — เลือกดูเฉพาะล็อตที่รับเข้าได้
        </p>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Layers className="h-4 w-4 text-rose-500" />
                    {lotLabel}
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-80 p-0">
                  <div className="flex items-center justify-between border-b px-3 py-2">
                    <p className="text-sm font-medium">ล็อตนำเข้า (ตามวันที่รับเข้า)</p>
                    <Button
                      variant="ghost" size="sm" className="h-7 px-2 text-xs"
                      onClick={() => setSelectedDates([])}
                      disabled={selectedDates.length === 0}
                    >
                      ล้าง
                    </Button>
                  </div>
                  <div className="max-h-72 overflow-y-auto p-1">
                    {lotOptions.length === 0 && (
                      <p className="px-3 py-6 text-center text-sm text-muted-foreground">ยังไม่มีข้อมูลรับเข้า</p>
                    )}
                    {lotOptions.map(lot => (
                      <label
                        key={lot.date}
                        className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"
                      >
                        <Checkbox
                          checked={selectedDates.includes(lot.date)}
                          onCheckedChange={() => toggleLot(lot.date)}
                        />
                        <span className="flex-1 text-sm">{formatDate(lot.date)}</span>
                        <span className="text-xs text-muted-foreground">
                          {lot.items} รายการ · เหลือ {num(lot.remaining)}
                        </span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหา SKU / ชื่อ / สี / ไซส์..."
                  className="h-9 w-56 pl-8 text-sm"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              {hasFilter && (
                <Button
                  variant="ghost" size="sm" className="h-9 gap-1 text-xs text-muted-foreground"
                  onClick={() => { setSelectedDates([]); setSearch(""); }}
                >
                  <X className="h-3.5 w-3.5" />
                  ล้างตัวกรอง
                </Button>
              )}
            </div>

            <Button
              variant="outline" size="sm" className="h-9 gap-2 self-start lg:self-auto"
              onClick={() => setHideSoldOut(v => !v)}
            >
              {hideSoldOut ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {hideSoldOut ? "แสดงของที่ขายหมดแล้ว" : "ซ่อนของที่ขายหมดแล้ว"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">คงเหลือรวม</p>
              <Boxes className="h-4 w-4 text-pink-400" />
            </div>
            <p className="text-3xl font-bold text-pink-600">{num(stats.remaining)}</p>
            <p className="mt-1 text-xs text-muted-foreground">ชิ้น · {groups.length} ล็อต</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">เงินทุนที่จมอยู่</p>
              <Coins className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{baht(stats.costValue)}</p>
            <p className="mt-1 text-xs text-muted-foreground">ต้นทุน × คงเหลือ</p>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <CardContent className="pt-5 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">ถ้าขายหมดจะได้เงิน</p>
              <CircleDollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{baht(stats.revenueValue)}</p>
            <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">ราคาขาย × คงเหลือ</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">กำไรคาดหวัง</p>
              <TrendingUp className="h-4 w-4 text-rose-400" />
            </div>
            <p className="text-2xl font-bold text-rose-600">{baht(stats.profit)}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              มาร์จิ้น {stats.marginPct.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* คำเตือนสินค้าที่ยังไม่ได้ใส่ราคาขาย */}
      {stats.noPriceItems > 0 && (
        <Card className="border-orange-200 bg-orange-50/80 dark:border-orange-900/50 dark:bg-orange-950/20">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
            <div className="text-sm">
              <p className="font-medium text-orange-800 dark:text-orange-300">
                มี {stats.noPriceItems} รายการ ({num(stats.noPriceQty)} ชิ้น) ที่ยังไม่ได้ใส่ราคาขาย
              </p>
              <p className="mt-0.5 text-orange-700/80 dark:text-orange-300/80">
                ยอด "ถ้าขายหมดจะได้เงิน" จึงต่ำกว่าความจริง — เติมราคาขายได้ที่หน้า สต๊อกคงเหลือ
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {!isLoading && chartData.length > 1 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">มูลค่าขายของที่เหลือ แยกตามล็อต (10 อันดับแรก)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value: number, key) => [baht(value), key === 'revenue' ? 'ถ้าขายหมด' : 'ต้นทุน']}
                  labelFormatter={(_, payload) => {
                    const date = payload?.[0]?.payload?.date;
                    return date ? `ล็อต ${formatDate(date)}` : '';
                  }}
                />
                <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill="#10b981" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* ตารางรายล็อต */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">แยกตามล็อตนำเข้า</CardTitle>
          <p className="text-xs text-muted-foreground">กดที่แถวเพื่อดูรายการสินค้าในล็อตนั้น</p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">กำลังโหลด...</div>
          ) : groups.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">ไม่พบรายการตามเงื่อนไขที่เลือก</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>ล็อต (วันที่รับเข้า)</TableHead>
                    <TableHead className="text-right">รายการ</TableHead>
                    <TableHead className="text-right">รับเข้า</TableHead>
                    <TableHead className="text-right">ขายแล้ว</TableHead>
                    <TableHead className="text-right">คงเหลือ</TableHead>
                    <TableHead className="text-right">ต้นทุนคงเหลือ</TableHead>
                    <TableHead className="text-right">ถ้าขายหมด</TableHead>
                    <TableHead className="text-right">กำไรคาดหวัง</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map(group => {
                    const isOpen = expanded.includes(group.date);
                    return (
                      <Fragment key={group.date}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() => toggleExpand(group.date)}
                      >
                        <TableCell className="text-muted-foreground">
                          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </TableCell>
                        <TableCell className="whitespace-nowrap font-medium">{formatDate(group.date)}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{group.items.length}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{num(group.totalIn)}</TableCell>
                        <TableCell className="text-right text-rose-500">{num(group.totalSold)}</TableCell>
                        <TableCell className="text-right font-medium">{num(group.remaining)}</TableCell>
                        <TableCell className="text-right text-amber-600">{baht(group.costValue)}</TableCell>
                        <TableCell className="text-right font-semibold text-emerald-600">{baht(group.revenueValue)}</TableCell>
                        <TableCell className="text-right text-rose-600">{baht(group.profit)}</TableCell>
                      </TableRow>

                      {isOpen && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={9} className="bg-muted/40 p-0">
                            <div className="overflow-x-auto p-3">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>ชื่อสินค้า</TableHead>
                                    <TableHead>สี / ไซส์</TableHead>
                                    <TableHead className="text-right">รับเข้า</TableHead>
                                    <TableHead className="text-right">ขายแล้ว</TableHead>
                                    <TableHead className="text-right">คงเหลือ</TableHead>
                                    <TableHead className="text-right">ทุน/ชิ้น</TableHead>
                                    <TableHead className="text-right">ขาย/ชิ้น</TableHead>
                                    <TableHead className="text-right">ถ้าขายหมด</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {group.visibleItems.map(item => {
                                    const left = Math.max(Number(item.remaining), 0);
                                    return (
                                      <TableRow key={item.id}>
                                        <TableCell className="whitespace-nowrap text-sm font-medium">{item.sku}</TableCell>
                                        <TableCell className="text-sm">{item.product_name}</TableCell>
                                        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                                          {[item.color, item.size].filter(Boolean).join(' / ') || '-'}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">{num(Number(item.quantity))}</TableCell>
                                        <TableCell className="text-right text-sm text-rose-500">{num(Number(item.qty_sold))}</TableCell>
                                        <TableCell className="text-right text-sm">
                                          {left > 0 ? (
                                            <span className="font-medium">{num(left)}</span>
                                          ) : (
                                            <Badge variant="outline" className="text-muted-foreground">หมด</Badge>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right text-sm text-muted-foreground">{baht(Number(item.cost_price))}</TableCell>
                                        <TableCell className="text-right text-sm">
                                          {Number(item.sell_price) > 0
                                            ? baht(Number(item.sell_price))
                                            : <span className="text-orange-500">ยังไม่ใส่ราคา</span>}
                                        </TableCell>
                                        <TableCell className="text-right text-sm font-semibold text-emerald-600">
                                          {baht(left * Number(item.sell_price))}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      </Fragment>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={5} className="font-medium">รวมทั้งหมด</TableCell>
                    <TableCell className="text-right font-medium">{num(stats.remaining)}</TableCell>
                    <TableCell className="text-right font-medium text-amber-600">{baht(stats.costValue)}</TableCell>
                    <TableCell className="text-right font-bold text-emerald-600">{baht(stats.revenueValue)}</TableCell>
                    <TableCell className="text-right font-medium text-rose-600">{baht(stats.profit)}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
