"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee, EmployeeCommissionReport, BranchCommission } from "@/types/employee";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEmployees } from "@/hooks/use-employees";
import {
  Plus,
  Users,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calculator,
  TrendingUp,
  Store,
  Globe,
  Loader2,
  AlertCircle
} from "lucide-react";

const mockEmployees: Employee[] = [
  {
    id: "1",
    name: "สมหญิง ใจดี",
    position: "พนักงานขาย",
    salary: 15000,
    storeCommission: 2.5,
    onlineCommission: 3.0,
    startDate: "2024-01-15",
    isActive: true,
    phone: "081-234-5678",
    email: "somying@example.com",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T09:00:00Z"
  },
  {
    id: "2",
    name: "สมชาย รักงาน",
    position: "หัวหน้าขาย",
    salary: 25000,
    storeCommission: 3.0,
    onlineCommission: 4.0,
    startDate: "2023-06-01",
    isActive: true,
    phone: "082-345-6789",
    email: "somchai@example.com",
    createdAt: "2023-06-01T09:00:00Z",
    updatedAt: "2023-06-01T09:00:00Z"
  }
];

const mockCommissionReports: EmployeeCommissionReport[] = [
  {
    employeeId: "1",
    employeeName: "สมหญิง ใจดี",
    period: "2024-12",
    storeSales: 50000,
    onlineSales: 30000,
    storeCommission: 1250,
    onlineCommission: 900,
    totalCommission: 2150,
    salary: 15000,
    totalEarnings: 17150
  },
  {
    employeeId: "2",
    employeeName: "สมชาย รักงาน",
    period: "2024-12",
    storeSales: 80000,
    onlineSales: 45000,
    storeCommission: 2400,
    onlineCommission: 1800,
    totalCommission: 4200,
    salary: 25000,
    totalEarnings: 29200
  }
];

export function EmployeeManagement() {
  const {
    employees,
    isLoading,
    error,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    isAddingEmployee,
    isUpdatingEmployee,
    isDeletingEmployee,
    refetch
  } = useEmployees();

  const [commissionReports] = useState<EmployeeCommissionReport[]>(mockCommissionReports);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    salary: 0,
    branchCommissions: [] as BranchCommission[],
    phone: "",
    email: "",
    address: "",
    note: "",
    isActive: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const employeeData = {
      name: formData.name,
      position: formData.position,
      salary: formData.salary,
      branchCommissions: formData.branchCommissions,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      note: formData.note,
      isActive: formData.isActive,
      startDate: editingEmployee?.startDate || new Date().toISOString().split('T')[0]
    };

    try {
      if (editingEmployee) {
        await updateEmployee({ employeeId: editingEmployee.id, updates: employeeData });
      } else {
        await addEmployee(employeeData);
      }

      // Reset form
      setFormData({
        name: "",
        position: "",
        salary: 0,
        branchCommissions: [],
        phone: "",
        email: "",
        address: "",
        note: "",
        isActive: true
      });
      setIsAddDialogOpen(false);
      setEditingEmployee(null);
    } catch (error) {
      console.error('Error submitting employee:', error);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      salary: employee.salary,
      branchCommissions: employee.branchCommissions || [],
      phone: employee.phone || "",
      email: employee.email || "",
      address: employee.address || "",
      note: employee.note || "",
      isActive: employee.isActive
    });
    setIsAddDialogOpen(true);
  };

  const addBranchCommission = () => {
    setFormData({
      ...formData,
      branchCommissions: [...formData.branchCommissions, { branchOrPlatform: "", commissionRate: 0 }]
    });
  };

  const removeBranchCommission = (index: number) => {
    const newCommissions = formData.branchCommissions.filter((_, i) => i !== index);
    setFormData({ ...formData, branchCommissions: newCommissions });
  };

  const updateBranchCommission = (index: number, field: keyof BranchCommission, value: string | number) => {
    const newCommissions = [...formData.branchCommissions];
    newCommissions[index] = { ...newCommissions[index], [field]: value };
    setFormData({ ...formData, branchCommissions: newCommissions });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const activeEmployees = employees.filter(emp => emp.isActive);
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">กำลังโหลดข้อมูลพนักงาน...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
          <p className="text-muted-foreground mb-4">
            ไม่สามารถโหลดข้อมูลพนักงานได้
          </p>
          <Button onClick={() => refetch()} variant="outline">
            ลองใหม่อีกครั้ง
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            จัดการพนักงาน
          </h1>
          <p className="text-muted-foreground mt-1">
            บันทึกข้อมูลพนักงาน ตั้งค่าเงินเดือน และคำนวณค่าคอมมิชชั่น
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มพนักงาน
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? "แก้ไขข้อมูลพนักงาน" : "เพิ่มพนักงานใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">ชื่อ-นามสกุล *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">ตำแหน่ง *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="salary">เงินเดือน (บาท) *</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              {/* Branch Commissions Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-base font-semibold">ค่าคอมตามสาขา/แพลตฟอร์ม</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addBranchCommission}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    เพิ่มสาขา
                  </Button>
                </div>
                
                {formData.branchCommissions.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                    ยังไม่มีการตั้งค่าคอมมิชชั่น คลิก "เพิ่มสาขา" เพื่อเริ่มต้น
                  </div>
                ) : (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {formData.branchCommissions.map((commission, index) => (
                      <div key={index} className="flex gap-2 items-end p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-xs">สาขา/แพลตฟอร์ม</Label>
                          <Input
                            placeholder="เลือกหรือพิมพ์ชื่อสาขา"
                            value={commission.branchOrPlatform}
                            onChange={(e) => updateBranchCommission(index, 'branchOrPlatform', e.target.value)}
                            className="text-sm"
                          />
                        </div>
                        <div className="w-24">
                          <Label className="text-xs">คอม (%)</Label>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="0.0"
                            value={commission.commissionRate || ''}
                            onChange={(e) => updateBranchCommission(index, 'commissionRate', Number(e.target.value) || 0)}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeBranchCommission(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="active">พนักงานที่ยังทำงานอยู่</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingEmployee(null);
                  setFormData({
                    name: "",
                    position: "",
                    salary: 0,
                    storeCommission: 0,
                    onlineCommission: 0,
                    phone: "",
                    email: "",
                    address: "",
                    note: "",
                    isActive: true
                  });
                }}>
                  ยกเลิก
                </Button>
                <Button type="submit" disabled={isAddingEmployee || isUpdatingEmployee}>
                  {(isAddingEmployee || isUpdatingEmployee) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    editingEmployee ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">พนักงานทั้งหมด</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">
              ทำงานอยู่ {activeEmployees.length} คน
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">เงินเดือนรวม</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSalary)}</div>
            <p className="text-xs text-muted-foreground">
              ต่อเดือน (พนักงานที่ทำงานอยู่)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">คอมมิชชั่นเดือนนี้</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(commissionReports.reduce((sum, report) => sum + report.totalCommission, 0))}
            </div>
            <p className="text-xs text-muted-foreground">
              จากยอดขายทั้งหมด
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">รายชื่อพนักงาน</TabsTrigger>
          <TabsTrigger value="commission">รายงานคอมมิชชั่น</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <div className="grid gap-6">
            {employees.map((employee) => (
              <Card key={employee.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-white via-gray-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 via-pink-500 to-purple-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {employee.name.charAt(0)}
                        </div>
                        {employee.isActive && (
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white">
                            {employee.name}
                          </CardTitle>
                          {!employee.isActive && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                              ไม่ทำงานแล้ว
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
                          {employee.position}
                        </CardDescription>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          เริ่มงาน: {formatDate(employee.startDate)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                        className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                        disabled={isDeletingEmployee}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        {isDeletingEmployee ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Salary and Commission Highlight Section */}
                  <div className="space-y-4 mb-6">
                    {/* Salary Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                          <Calculator className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-green-700 dark:text-green-300">เงินเดือน</div>
                          <div className="text-2xl font-bold text-green-800 dark:text-green-200">
                            {formatCurrency(employee.salary)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Branch Commissions Section */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                          <Store className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-blue-700 dark:text-blue-300">ค่าคอมตามสาขา/แพลตฟอร์ม</div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">
                            {employee.branchCommissions?.length || 0} สาขา/แพลตฟอร์ม
                          </div>
                        </div>
                      </div>
                      
                      {employee.branchCommissions && employee.branchCommissions.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {employee.branchCommissions.map((commission, index) => (
                            <div key={index} className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-blue-100 dark:border-blue-800">
                              <div className="text-sm font-medium text-blue-800 dark:text-blue-200 truncate">
                                {commission.branchOrPlatform}
                              </div>
                              <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                                {commission.commissionRate}%
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-blue-600 dark:text-blue-400 text-sm">
                          ยังไม่มีการตั้งค่าคอมมิชชั่น
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {employee.phone && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{employee.phone}</span>
                      </div>
                    )}
                    {employee.email && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">{employee.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {employee.address && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                      <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{employee.address}</span>
                    </div>
                  )}

                  {/* Note */}
                  {employee.note && (
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">!</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-1">หมายเหตุ</div>
                          <div className="text-sm text-amber-700 dark:text-amber-300">{employee.note}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {employees.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">ยังไม่มีข้อมูลพนักงาน</h3>
                <p className="text-muted-foreground text-center mb-4">
                  เริ่มต้นเพิ่มข้อมูลพนักงานและตั้งค่าเงินเดือน
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่มพนักงานคนแรก
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="commission" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>รายงานคอมมิชชั่นประจำเดือน</CardTitle>
              <CardDescription>
                คำนวณค่าคอมมิชชั่นจากยอดขายหน้าร้านและออนไลน์
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>พนักงาน</TableHead>
                    <TableHead className="text-right">ยอดขายหน้าร้าน</TableHead>
                    <TableHead className="text-right">ยอดขายออนไลน์</TableHead>
                    <TableHead className="text-right">คอมหน้าร้าน</TableHead>
                    <TableHead className="text-right">คอมออนไลน์</TableHead>
                    <TableHead className="text-right">คอมรวม</TableHead>
                    <TableHead className="text-right">เงินเดือน</TableHead>
                    <TableHead className="text-right">รวมทั้งหมด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {commissionReports.map((report) => (
                    <TableRow key={`${report.employeeId}-${report.period}`}>
                      <TableCell className="font-medium">{report.employeeName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.storeSales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.onlineSales)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.storeCommission)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.onlineCommission)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(report.totalCommission)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(report.salary)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(report.totalEarnings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}