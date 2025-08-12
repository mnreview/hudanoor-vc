"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Income, Expense, FilterOptions } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, Calendar, Eye, EyeOff } from "lucide-react";
import { format, parseISO, startOfMonth, endOfMonth, eachMonthOfInterval, subMonths } from "date-fns";
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
  const [visibleLines, setVisibleLines] = useState({
    income: true,
    expense: true,
    profit: true,
    quantity: true
  });

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
          {/* Legend Controls */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={visibleLines.income ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine('income')}
              className={visibleLines.income ? "bg-blue-500 hover:bg-blue-600" : ""}
            >
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              ยอดขาย
            </Button>
            <Button
              variant={visibleLines.expense ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine('expense')}
              className={visibleLines.expense ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              ค่าใช้จ่าย
            </Button>
            <Button
              variant={visibleLines.profit ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine('profit')}
              className={visibleLines.profit ? "bg-green-500 hover:bg-green-600" : ""}
            >
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              กำไร
            </Button>
            <Button
              variant={visibleLines.quantity ? "default" : "outline"}
              size="sm"
              onClick={() => toggleLine('quantity')}
              className={visibleLines.quantity ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              จำนวนชิ้น
            </Button>
          </div>

          {/* Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                <XAxis 
                  dataKey="monthLabel" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => `${value}`}
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

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
              <div className="text-sm text-muted-foreground">ยอดขายรวม</div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.income, 0))}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-red-100 dark:border-red-800">
              <div className="text-sm text-muted-foreground">ค่าใช้จ่ายรวม</div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.expense, 0))}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-green-100 dark:border-green-800">
              <div className="text-sm text-muted-foreground">กำไรรวม</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(monthlyData.reduce((sum, item) => sum + item.profit, 0))}
              </div>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-orange-100 dark:border-orange-800">
              <div className="text-sm text-muted-foreground">ชิ้นรวม</div>
              <div className="text-lg font-bold text-orange-600">
                {monthlyData.reduce((sum, item) => sum + item.quantity, 0).toLocaleString()} ชิ้น
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}