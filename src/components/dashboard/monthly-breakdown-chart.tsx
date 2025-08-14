"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Income, Expense, FilterOptions } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Calendar, Eye, EyeOff } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";
import { th } from "date-fns/locale";

interface MonthlyBreakdownChartProps {
  incomeData: Income[];
  expenseData: Expense[];
  filters: FilterOptions;
}

interface MonthlyData {
  month: string;
  monthLabel: string;
  income: number;
  expense: number;
  profit: number;
  quantity: number;
}

export function MonthlyBreakdownChart({ incomeData, expenseData, filters }: MonthlyBreakdownChartProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [visibleLines, setVisibleLines] = useState({
    income: true,
    expense: true,
    profit: true,
    quantity: true
  });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Filter data based on active filters
  const filteredIncomeData = incomeData.filter(item => {
    if (filters.dateFrom && item.date < filters.dateFrom) return false;
    if (filters.dateTo && item.date > filters.dateTo) return false;
    if (filters.channels?.length && !filters.channels.includes(item.channel)) return false;
    if (filters.branches?.length && !filters.branches.includes(item.branch_or_platform)) return false;
    if (filters.productCategories?.length && !filters.productCategories.includes(item.product_category)) return false;
    if (filters.q && !item.product_name.toLowerCase().includes(filters.q.toLowerCase()) &&
      !item.note?.toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  });

  const filteredExpenseData = expenseData.filter(item => {
    if (filters.dateFrom && item.date < filters.dateFrom) return false;
    if (filters.dateTo && item.date > filters.dateTo) return false;
    if (filters.channels?.length && !filters.channels.includes(item.channel)) return false;
    if (filters.branches?.length && !filters.branches.includes(item.branch_or_platform)) return false;
    if (filters.expenseCategories?.length && !filters.expenseCategories.includes(item.expense_category)) return false;
    if (filters.q && !item.expense_item.toLowerCase().includes(filters.q.toLowerCase()) &&
      !item.note?.toLowerCase().includes(filters.q.toLowerCase())) return false;
    return true;
  });

  // Generate monthly data based on filtered data range
  const allDates = [
    ...filteredIncomeData.map(item => parseISO(item.date)),
    ...filteredExpenseData.map(item => parseISO(item.date))
  ];

  let months: Date[];

  if (allDates.length === 0) {
    // If no data, show current month
    const currentMonth = new Date();
    months = [startOfMonth(currentMonth)];
  } else {
    // Get date range from filtered data
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));

    const startDate = startOfMonth(minDate);
    const endDate = endOfMonth(maxDate);
    months = eachMonthOfInterval({ start: startDate, end: endDate });
  }

  const monthlyData: MonthlyData[] = months.map(month => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    const monthIncome = filteredIncomeData
      .filter(item => {
        const itemDate = parseISO(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      })
      .reduce((sum, item) => sum + item.amount, 0);

    const monthExpense = filteredExpenseData
      .filter(item => {
        const itemDate = parseISO(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      })
      .reduce((sum, item) => sum + item.cost, 0);

    const monthQuantity = filteredIncomeData
      .filter(item => {
        const itemDate = parseISO(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
      })
      .reduce((sum, item) => sum + item.quantity, 0);

    return {
      month: format(month, 'yyyy-MM'),
      monthLabel: format(month, 'MMM yyyy', { locale: th }),
      income: monthIncome,
      expense: monthExpense,
      profit: monthIncome - monthExpense,
      quantity: monthQuantity
    };
  });

  const toggleLine = (line: keyof typeof visibleLines) => {
    setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {
                entry.dataKey === 'quantity'
                  ? `${entry.value.toLocaleString()} ชิ้น`
                  : formatCurrency(entry.value)
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="card-elevated bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-950 border-purple-200 dark:border-purple-800">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <div className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <Calendar className="h-4 w-4" />
            </div>
            แนวโน้มรายเดือน
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="hover:bg-purple-100 dark:hover:bg-purple-900"
          >
            {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {/* Summary Stats - Clickable Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div
              className={`cursor-pointer transition-all duration-200 rounded-lg p-3 border-2 ${visibleLines.income
                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-700 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-700'
                }`}
              onClick={() => toggleLine('income')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs sm:text-sm text-muted-foreground">ยอดขาย</div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleLines.income ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 dark:text-blue-400 leading-tight">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.income, 0))}
              </div>
              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {visibleLines.income ? 'คลิกซ่อน' : 'คลิกแสดง'}
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-200 rounded-lg p-3 border-2 ${visibleLines.expense
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-700 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-red-200 dark:hover:border-red-700'
                }`}
              onClick={() => toggleLine('expense')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs sm:text-sm text-muted-foreground">ค่าใช้จ่าย</div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleLines.expense ? 'bg-red-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-red-600 dark:text-red-400 leading-tight">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.expense, 0))}
              </div>
              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {visibleLines.expense ? 'คลิกซ่อน' : 'คลิกแสดง'}
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-200 rounded-lg p-3 border-2 ${visibleLines.profit
                ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-700 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-green-200 dark:hover:border-green-700'
                }`}
              onClick={() => toggleLine('profit')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs sm:text-sm text-muted-foreground">กำไร</div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleLines.profit ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 dark:text-green-400 leading-tight">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.profit, 0))}
              </div>
              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {visibleLines.profit ? 'คลิกซ่อน' : 'คลิกแสดง'}
              </div>
            </div>

            <div
              className={`cursor-pointer transition-all duration-200 rounded-lg p-3 border-2 ${visibleLines.quantity
                ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-700 shadow-md'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-orange-200 dark:hover:border-orange-700'
                }`}
              onClick={() => toggleLine('quantity')}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs sm:text-sm text-muted-foreground">จำนวนชิ้น</div>
                <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${visibleLines.quantity ? 'bg-orange-500' : 'bg-gray-300'}`}></div>
              </div>
              <div className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600 dark:text-orange-400 leading-tight">
                {monthlyData.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground mt-1 hidden sm:block">
                {visibleLines.quantity ? 'คลิกซ่อน' : 'คลิกแสดง'}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={monthlyData} 
                margin={{ 
                  top: 5, 
                  right: isMobile ? 10 : 30, 
                  left: isMobile ? 10 : 20, 
                  bottom: isMobile ? 60 : 5 
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis
                  dataKey="monthLabel"
                  stroke="#6b7280"
                  fontSize={isMobile ? 10 : 12}
                  angle={isMobile ? -45 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 60 : 30}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  width={isMobile ? 40 : 60}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={isMobile ? 10 : 12}
                  tickFormatter={(value) => `${value}`}
                  width={isMobile ? 30 : 40}
                />
                <Tooltip content={<CustomTooltip />} />

                {visibleLines.income && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                    name="ยอดขาย"
                  />
                )}

                {visibleLines.expense && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="expense"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ef4444', strokeWidth: 2 }}
                    name="ค่าใช้จ่าย"
                  />
                )}

                {visibleLines.profit && (
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="profit"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                    name="กำไร"
                  />
                )}

                {visibleLines.quantity && (
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quantity"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                    name="จำนวนชิ้น"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      )}
    </Card>
  );
}