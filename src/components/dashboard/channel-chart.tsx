
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChannelData } from "@/types";
import { formatCurrency, getChannelLabel } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface ChannelChartProps {
  data: ChannelData[];
}

export function ChannelChart({ data }: ChannelChartProps) {
  const chartData = data.map(item => ({
    ...item,
    channelLabel: getChannelLabel(item.channel as 'store' | 'online')
  }));

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>เปรียบเทียบช่องทางขาย</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="channelLabel" fontSize={12} />
            <YAxis fontSize={12} tickFormatter={(value) => formatCurrency(value)} />
            <Tooltip 
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'income' ? 'รายรับ' : 'รายจ่าย'
              ]}
            />
            <Legend 
              formatter={(value) => value === 'income' ? 'รายรับ' : 'รายจ่าย'}
            />
            <Bar dataKey="income" fill="hsl(var(--income-color))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" fill="hsl(var(--expense-color))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
