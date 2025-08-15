"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FilterOptions } from "@/types";
import { formatDate } from "@/lib/utils";
import { CalendarIcon, Filter, X, Search, ChevronDown, ChevronUp } from "lucide-react";

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
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomDateMode, setIsCustomDateMode] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState<Date | undefined>(undefined);
  const [tempDateRange, setTempDateRange] = useState<{ from?: Date; to?: Date }>({});

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  // Helper function to get current date range preset
  const getDateRangePreset = (filters: FilterOptions): string => {
    if (!filters.dateFrom && !filters.dateTo) return 'max';

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check for 7 days ago
    const last7Days = new Date(today);
    last7Days.setDate(last7Days.getDate() - 7);
    if (filters.dateFrom === last7Days.toISOString() && filters.dateTo === today.toISOString()) {
      return 'last7days';
    }

    // Check for 30 days ago
    const last30Days = new Date(today);
    last30Days.setDate(last30Days.getDate() - 30);
    if (filters.dateFrom === last30Days.toISOString() && filters.dateTo === today.toISOString()) {
      return 'last30days';
    }

    // Check for this month
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    if (filters.dateFrom === thisMonthStart.toISOString() && filters.dateTo === thisMonthEnd.toISOString()) {
      return 'thisMonth';
    }

    // Check for last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    if (filters.dateFrom === lastMonthStart.toISOString() && filters.dateTo === lastMonthEnd.toISOString()) {
      return 'lastMonth';
    }

    // Check for this year
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const thisYearEnd = new Date(now.getFullYear(), 11, 31);
    if (filters.dateFrom === thisYearStart.toISOString() && filters.dateTo === thisYearEnd.toISOString()) {
      return 'thisYear';
    }

    // Check for last year
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
    if (filters.dateFrom === lastYearStart.toISOString() && filters.dateTo === lastYearEnd.toISOString()) {
      return 'lastYear';
    }

    return 'custom';
  };

  // Handle date range preset selection
  const handleDateRangePreset = (preset: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (preset) {
      case 'max':
        setIsCustomDateMode(false);
        onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined });
        break;

      case 'last7days':
        setIsCustomDateMode(false);
        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);
        onFiltersChange({
          ...filters,
          dateFrom: last7Days.toISOString(),
          dateTo: today.toISOString()
        });
        break;

      case 'last30days':
        setIsCustomDateMode(false);
        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);
        onFiltersChange({
          ...filters,
          dateFrom: last30Days.toISOString(),
          dateTo: today.toISOString()
        });
        break;

      case 'thisMonth':
        setIsCustomDateMode(false);
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        onFiltersChange({
          ...filters,
          dateFrom: thisMonthStart.toISOString(),
          dateTo: thisMonthEnd.toISOString()
        });
        break;

      case 'lastMonth':
        setIsCustomDateMode(false);
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        onFiltersChange({
          ...filters,
          dateFrom: lastMonthStart.toISOString(),
          dateTo: lastMonthEnd.toISOString()
        });
        break;

      case 'thisYear':
        setIsCustomDateMode(false);
        const thisYearStart = new Date(now.getFullYear(), 0, 1);
        const thisYearEnd = new Date(now.getFullYear(), 11, 31);
        onFiltersChange({
          ...filters,
          dateFrom: thisYearStart.toISOString(),
          dateTo: thisYearEnd.toISOString()
        });
        break;

      case 'lastYear':
        setIsCustomDateMode(false);
        const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);
        onFiltersChange({
          ...filters,
          dateFrom: lastYearStart.toISOString(),
          dateTo: lastYearEnd.toISOString()
        });
        break;

      case 'custom':
        // Set custom mode to show date pickers
        setIsCustomDateMode(true);
        setTempDateRange({});
        setSelectedStartDate(undefined);
        break;

      default:
        break;
    }
  };

  // Handle calendar date selection with two-click confirmation
  const handleCalendarDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!selectedStartDate) {
      // First click - select start date
      setSelectedStartDate(date);
      setTempDateRange({ from: date, to: undefined });
    } else {
      // Second click - select end date and confirm range
      const startDate = selectedStartDate;
      const endDate = date;
      
      // Ensure start date is before end date
      const finalStartDate = startDate <= endDate ? startDate : endDate;
      const finalEndDate = startDate <= endDate ? endDate : startDate;
      
      // Apply the date range
      onFiltersChange({
        ...filters,
        dateFrom: finalStartDate.toISOString(),
        dateTo: finalEndDate.toISOString()
      });
      
      // Reset selection state
      setSelectedStartDate(undefined);
      setTempDateRange({});
      setDatePickerOpen(false);
      setIsCustomDateMode(true);
    }
  };

  // Reset calendar selection when opening
  const handleCalendarOpen = () => {
    setSelectedStartDate(undefined);
    setTempDateRange({});
    setDatePickerOpen(true);
  };

  // Get date range label for display
  const getDateRangeLabel = (filters: FilterOptions): string => {
    const preset = getDateRangePreset(filters);

    switch (preset) {
      case 'last7days':
        return '7 วันที่ผ่านมา';
      case 'last30days':
        return '30 วันที่ผ่านมา';
      case 'thisMonth':
        return 'เดือนนี้';
      case 'lastMonth':
        return 'เดือนที่แล้ว';
      case 'thisYear':
        return 'ปีนี้';
      case 'lastYear':
        return 'ปีที่แล้ว';
      case 'custom':
        if (filters.dateFrom && filters.dateTo) {
          return `${formatDate(filters.dateFrom)} - ${formatDate(filters.dateTo)}`;
        } else if (filters.dateFrom) {
          return `จาก ${formatDate(filters.dateFrom)}`;
        } else if (filters.dateTo) {
          return `ถึง ${formatDate(filters.dateTo)}`;
        }
        return '';
      case 'max':
      default:
        return 'สูงสุด';
    }
  };

  return (
    <div className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-4">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>ตัวกรองข้อมูล</span>
              {hasActiveFilters && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {Object.keys(filters).length}
                </span>
              )}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              ล้างทั้งหมด
            </Button>
          )}
        </div>

        <CollapsibleContent className="space-y-4">
          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Date Range Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">ช่วงวันที่</Label>
              <Select value={getDateRangePreset(filters)} onValueChange={handleDateRangePreset}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">7 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="last30days">30 วันที่ผ่านมา</SelectItem>
                  <SelectItem value="thisMonth">เดือนนี้</SelectItem>
                  <SelectItem value="lastMonth">เดือนที่แล้ว</SelectItem>
                  <SelectItem value="thisYear">ปีนี้</SelectItem>
                  <SelectItem value="lastYear">ปีที่แล้ว</SelectItem>
                  <SelectItem value="max">สูงสุด</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Display and Calendar - Always Available */}
              <div className="mt-2 space-y-2">
                {/* Current Selection Display */}
                {getDateRangeLabel(filters) && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-700">
                    <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1">
                      ช่วงที่เลือก: {getDateRangeLabel(filters)}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      {filters.dateFrom && filters.dateTo && (
                        <>จาก {formatDate(filters.dateFrom)} ถึง {formatDate(filters.dateTo)}</>
                      )}
                    </div>
                  </div>
                )}

                {/* Calendar Picker - Always Available */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">เลือกช่วงวันที่จากปฏิทิน</Label>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start text-left font-normal"
                        onClick={handleCalendarOpen}
                      >
                        <CalendarIcon className="mr-2 h-3 w-3" />
                        <span className="text-xs">
                          คลิกเพื่อเลือกช่วงวันที่จากปฏิทิน
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <div className="p-3 border-b bg-muted/50">
                        <div className="text-sm font-medium">
                          {!selectedStartDate ? 'คลิกครั้งที่ 1: เลือกวันเริ่มต้น' : 'คลิกครั้งที่ 2: เลือกวันสิ้นสุด'}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {selectedStartDate 
                            ? `วันเริ่มต้น: ${formatDate(selectedStartDate.toISOString())}`
                            : 'เลือกวันที่ในปฏิทินด้านล่าง'
                          }
                        </div>
                        {tempDateRange.from && tempDateRange.to && (
                          <div className="text-xs text-blue-600 mt-1 font-medium">
                            ช่วงที่เลือก: {formatDate(tempDateRange.from.toISOString())} - {formatDate(tempDateRange.to.toISOString())}
                          </div>
                        )}
                      </div>
                      <Calendar
                        mode="single"
                        selected={selectedStartDate}
                        onSelect={handleCalendarDateSelect}
                        className="pointer-events-auto"
                        modifiers={{
                          selected: selectedStartDate ? [selectedStartDate] : [],
                          range_start: tempDateRange.from ? [tempDateRange.from] : [],
                          range_end: tempDateRange.to ? [tempDateRange.to] : [],
                          range_middle: tempDateRange.from && tempDateRange.to ? 
                            Array.from({ length: Math.abs(tempDateRange.to.getTime() - tempDateRange.from.getTime()) / (1000 * 60 * 60 * 24) }, (_, i) => {
                              const date = new Date(tempDateRange.from!);
                              date.setDate(date.getDate() + i + 1);
                              return date;
                            }).filter(date => date < tempDateRange.to!) : []
                        }}
                        modifiersStyles={{
                          selected: { backgroundColor: '#f97316', color: 'white' },
                          range_start: { backgroundColor: '#f97316', color: 'white' },
                          range_end: { backgroundColor: '#f97316', color: 'white' },
                          range_middle: { backgroundColor: '#fed7aa', color: '#9a3412' }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </Card>

            {/* Channel Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">ช่องทางขาย</Label>
              <Select
                value={filters.channels?.[0] || "all"}
                onValueChange={(value) => onFiltersChange({
                  ...filters,
                  channels: value === "all" ? [] : [value as any]
                })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="เลือกช่องทาง" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="store">หน้าร้าน</SelectItem>
                  <SelectItem value="online">ออนไลน์</SelectItem>
                </SelectContent>
              </Select>
            </Card>

            {/* Branch/Platform Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">สาขา/แพลตฟอร์ม</Label>
              <Select
                value={filters.branches?.[0] || "all"}
                onValueChange={(value) => onFiltersChange({
                  ...filters,
                  branches: value === "all" ? [] : [value]
                })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="เลือกสาขา/แพลตฟอร์ม" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {availableBranches.filter(branch => branch && branch.trim() !== '').map(branch => (
                    <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Product Categories Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">หมวดหมู่สินค้า</Label>
              <Select
                value={filters.productCategories?.[0] || "all"}
                onValueChange={(value) => onFiltersChange({
                  ...filters,
                  productCategories: value === "all" ? [] : [value]
                })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="เลือกหมวดหมู่สินค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {availableProductCategories.filter(category => category && category.trim() !== '').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Expense Categories Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">หมวดหมู่จ่าย</Label>
              <Select
                value={filters.expenseCategories?.[0] || "all"}
                onValueChange={(value) => onFiltersChange({
                  ...filters,
                  expenseCategories: value === "all" ? [] : [value]
                })}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="เลือกหมวดหมู่จ่าย" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  {availableExpenseCategories.filter(category => category && category.trim() !== '').map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Card>

            {/* Search Filter */}
            <Card className="p-4">
              <Label className="text-sm font-medium mb-2 block">ค้นหา</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อสินค้า หรือหมายเหตุ..."
                  value={filters.q || ""}
                  onChange={(e) => onFiltersChange({ ...filters, q: e.target.value })}
                  className="h-9 pl-8"
                />
              </div>
            </Card>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              <span className="text-sm text-muted-foreground">ตัวกรองที่ใช้งาน:</span>

              {getDateRangeLabel(filters) && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  📅 {getDateRangeLabel(filters)}
                  <button
                    onClick={() => onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.channels?.[0] && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  🏪 {filters.channels[0] === 'store' ? 'หน้าร้าน' : 'ออนไลน์'}
                  <button
                    onClick={() => onFiltersChange({ ...filters, channels: [] })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.branches?.[0] && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  🏢 {filters.branches[0]}
                  <button
                    onClick={() => onFiltersChange({ ...filters, branches: [] })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.productCategories?.[0] && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  📦 {filters.productCategories[0]}
                  <button
                    onClick={() => onFiltersChange({ ...filters, productCategories: [] })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.expenseCategories?.[0] && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  💰 {filters.expenseCategories[0]}
                  <button
                    onClick={() => onFiltersChange({ ...filters, expenseCategories: [] })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {filters.q && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                  🔍 "{filters.q}"
                  <button
                    onClick={() => onFiltersChange({ ...filters, q: undefined })}
                    className="hover:bg-primary/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}