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
import { Employee, EmployeeCommissionReport } from "@/types/employee";
import { formatCurrency, formatDate } from "@/lib/utils";
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
  Globe
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
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [commissionReports] = useState<EmployeeCommissionReport[]>(mockCommissionReports);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newEmployee: Employee = {
      id: editingEmployee?.id || Date.now().toString(),
      ...formData,
      startDate: editingEmployee?.startDate || new Date().toISOString().split('T')[0],
      createdAt: editingEmployee?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingEmployee) {
      setEmployees(employees.map(emp => emp.id === editingEmployee.id ? newEmployee : emp));
    } else {
      setEmployees([...employees, newEmployee]);
    }

    // Reset form
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
    setIsAddDialogOpen(false);
    setEditingEmployee(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      position: employee.position,
      salary: employee.salary,
      storeCommission: employee.storeCommission,
      onlineCommission: employee.onlineCommission,
      phone: employee.phone || "",
      email: employee.email || "",
      address: employee.address || "",
      note: employee.note || "",
      isActive: employee.isActive
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const activeEmployees = employees.filter(emp => emp.isActive);
  const totalSalary = activeEmployees.reduce((sum, emp) => sum + emp.salary, 0);

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
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">ตำแหน่ง *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, salary: Number(e.target.value)})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="storeCommission">คอมหน้าร้าน (%)</Label>
                  <Input
                    id="storeCommission"
                    type="number"
                    step="0.1"
                    value={formData.storeCommission}
                    onChange={(e) => setFormData({...formData, storeCommission: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="onlineCommission">คอมออนไลน์ (%)</Label>
                  <Input
                    id="onlineCommission"
                    type="number"
                    step="0.1"
                    value={formData.onlineCommission}
                    onChange={(e) => setFormData({...formData, onlineCommission: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="email">อีเมล</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">ที่อยู่</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
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
                <Button type="submit">
                  {editingEmployee ? "บันทึกการแก้ไข" : "เพิ่มพนักงาน"}
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
          <div className="grid gap-4">
            {employees.map((employee) => (
              <Card key={employee.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {employee.name}
                          {!employee.isActive && (
                            <Badge variant="secondary">ไม่ทำงานแล้ว</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{employee.position}</CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>เริ่มงาน: {formatDate(employee.startDate)}</span>
                          <span>เงินเดือน: {formatCurrency(employee.salary)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(employee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">คอมหน้าร้าน: {employee.storeCommission}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">คอมออนไลน์: {employee.onlineCommission}%</span>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{employee.phone}</span>
                      </div>
                    )}
                    {employee.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{employee.email}</span>
                      </div>
                    )}
                  </div>
                  {employee.address && (
                    <div className="flex items-start gap-2 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm text-muted-foreground">{employee.address}</span>
                    </div>
                  )}
                  {employee.note && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <strong>หมายเหตุ:</strong> {employee.note}
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