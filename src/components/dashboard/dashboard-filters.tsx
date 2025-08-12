
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FilterOptions } from "@/types";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, Filter, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBranches: string[];
  availableProductCategories: string[];
  availableExpenseCategories: string[];
}

export function DashboardFilters({
  filters,
  onFiltersChange,
  availableBranches,
  availableProductCategories,
  availableExpenseCategories
}: DashboardFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({});
    setIsOpen(false);
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <div className="mb-6">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("gap-2", hasActiveFilters && "border-primary")}>
            <Filter className="h-4 w-4" />
            ตัวกรอง
            {hasActiveFilters && (
              <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full text-xs">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96 p-0" align="start">
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">ตัวกรองข้อมูล</CardTitle>
                <div className="flex gap-2">
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      ล้าง
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Range */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">จากวันที่</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateFrom ? formatDate(filters.dateFrom) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                        onSelect={(date) => updateFilter('dateFrom', date?.toISOString())}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-sm">ถึงวันที่</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateTo ? formatDate(filters.dateTo) : "เลือกวันที่"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                        onSelect={(date) => updateFilter('dateTo', date?.toISOString())}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Channel */}
              <div>
                <Label className="text-sm">ช่องทางขาย</Label>
                <Select value={filters.channels?.[0] || ""} onValueChange={(value) => updateFilter('channels', value ? [value] : [])}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกช่องทาง" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    <SelectItem value="store">หน้าร้าน</SelectItem>
                    <SelectItem value="online">ออนไลน์</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Branch/Platform */}
              <div>
                <Label className="text-sm">สาขา/แพลตฟอร์ม</Label>
                <Select value={filters.branches?.[0] || ""} onValueChange={(value) => updateFilter('branches', value && value !== "all" ? [value] : [])}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกสาขา/แพลตฟอร์ม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {availableBranches.map(branch => (
                      <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Categories */}
              <div>
                <Label className="text-sm">หมวดหมู่สินค้า</Label>
                <Select value={filters.productCategories?.[0] || ""} onValueChange={(value) => updateFilter('productCategories', value && value !== "all" ? [value] : [])}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกหมวดหมู่สินค้า" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {availableProductCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Expense Categories */}
              <div>
                <Label className="text-sm">หมวดหมู่จ่าย</Label>
                <Select value={filters.expenseCategories?.[0] || ""} onValueChange={(value) => updateFilter('expenseCategories', value && value !== "all" ? [value] : [])}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="เลือกหมวดหมู่จ่าย" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">ทั้งหมด</SelectItem>
                    {availableExpenseCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <Label className="text-sm">ค้นหา</Label>
                <Input
                  placeholder="ค้นหาชื่อสินค้า หรือหมายเหตุ..."
                  value={filters.q || ""}
                  onChange={(e) => updateFilter('q', e.target.value)}
                  className="h-9"
                />
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
}
