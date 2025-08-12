
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";

interface TrendChartProps {
  data: ChartData[];
  title?: string;
  description?: string;
}

export function TrendChart({ data, title = "แนวโน้มรายวัน", description = "เปรียบเทียบรายรับ รายจ่าย และกำไร" }: TrendChartProps) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis 
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip 
              labelFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
              }}
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'income' ? 'รายรับ' : name === 'expense' ? 'รายจ่าย' : 'กำไร'
              ]}
            />
            <Legend 
              formatter={(value) => 
                value === 'income' ? 'รายรับ' : value === 'expense' ? 'รายจ่าย' : 'กำไร'
              }
            />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="hsl(var(--income-color))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--income-color))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="expense" 
              stroke="hsl(var(--expense-color))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--expense-color))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="hsl(var(--profit-color))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--profit-color))", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
