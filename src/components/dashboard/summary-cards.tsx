
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardSummary } from "@/types";
import { formatCurrency, formatNumber, calculatePercentageChange } from "@/lib/utils";
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, TrendingUp as ProfitIcon, Package } from "lucide-react";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "ยอดขายรวม",
      value: formatCurrency(summary.totalIncome),
      change: summary.periodComparison?.incomeChange,
      icon: DollarSign,
      colorClass: "income-color",
      bgClass: "bg-income"
    },
    {
      title: "ค่าใช้จ่ายรวม", 
      value: formatCurrency(summary.totalExpense),
      change: summary.periodComparison?.expenseChange,
      icon: ShoppingCart,
      colorClass: "expense-color",
      bgClass: "bg-expense"
    },
    {
      title: "กำไรเบื้องต้น",
      value: formatCurrency(summary.profit),
      change: summary.periodComparison?.profitChange,
      icon: ProfitIcon,
      colorClass: "profit-color",
      bgClass: "bg-profit"
    },
    {
      title: "จำนวนชิ้นขาย",
      value: formatNumber(summary.totalQuantity) + " ชิ้น",
      change: undefined,
      icon: Package,
      colorClass: "text-primary",
      bgClass: "bg-primary"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={card.title} className="card-elevated animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgClass} bg-opacity-20`}>
              <card.icon className={`h-4 w-4 ${card.colorClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            {card.change !== undefined && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {card.change >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={card.change >= 0 ? "text-green-500" : "text-red-500"}>
                  {Math.abs(card.change).toFixed(1)}%
                </span>
                <span className="ml-1">จากเดือนที่แล้ว</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
