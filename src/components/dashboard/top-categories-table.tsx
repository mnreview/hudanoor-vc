
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TopCategoryData } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TopCategoriesTableProps {
  data: TopCategoryData[];
  title: string;
  type: 'income' | 'expense';
}

export function TopCategoriesTable({ data, title, type }: TopCategoriesTableProps) {
  const topData = data.slice(0, 5);

  return (
    <Card className="card-elevated">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {type === 'income' ? (
            <TrendingUp className="h-5 w-5 text-income" />
          ) : (
            <TrendingDown className="h-5 w-5 text-expense" />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>หมวดหมู่</TableHead>
              <TableHead className="text-right">ยอดรวม</TableHead>
              <TableHead className="text-right">จำนวน</TableHead>
              <TableHead className="text-right">%</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topData.length > 0 ? (
              topData.map((item, index) => (
                <TableRow key={item.category}>
                  <TableCell className="font-medium">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      index === 2 ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </span>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell className="text-right font-medium">
                    <span className={type === 'income' ? 'text-income' : 'text-expense'}>
                      {formatCurrency(item.total)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">{item.percentage.toFixed(1)}%</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                  ไม่มีข้อมูล
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
