
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

interface CategoryChartProps {
  data: CategoryData[];
  title: string;
  type: 'income' | 'expense';
}

const COLORS = [
  'hsl(210, 100%, 50%)',
  'hsl(160, 100%, 40%)',
  'hsl(45, 100%, 50%)',
  'hsl(300, 100%, 50%)',
  'hsl(15, 100%, 50%)',
  'hsl(270, 100%, 50%)',
];

export function CategoryChart({ data, title, type }: CategoryChartProps) {
  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percentage }) => `${name} (${percentage.toFixed(1)}%)`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), type === 'income' ? 'ยอดขาย' : 'ค่าใช้จ่าย']}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
