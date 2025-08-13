"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { UpdateLog } from "@/types/settings";
import { formatDate } from "@/lib/utils";
import { 
  Plus, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Wrench, 
  Shield,
  Edit,
  Trash2
} from "lucide-react";

const mockUpdateLogs: UpdateLog[] = [
  {
    id: "10",
    version: "1.3.6",
    date: "2024-12-08",
    title: "อัปเดตเอกสาร README สำหรับสถาปัตยกรรมใหม่",
    description: "อัปเดต README.md ให้สะท้อนการเปลี่ยนแปลงสถาปัตยกรรมจาก Google Apps Script เป็น Vercel Serverless Functions พร้อมระบุการใช้ Google Sheets API โดยตรงแทนการผ่าน Google Apps Script",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T23:59:30Z"
  },
  {
    id: "09",
    version: "1.3.5",
    date: "2024-12-08",
    title: "เสร็จสิ้นการย้ายไป Vercel API อย่างสมบูรณ์",
    description: "อัปเดต sheets-adapter.ts ให้ใช้ Vercel API เป็นหลักในทุกสถานการณ์ โดยลบ conditional logic ที่เลือกระหว่าง Google Sheets API และ Vercel API ออก ทำให้ระบบใช้ Vercel Serverless Functions อย่างเต็มรูปแบบและเสถียรมากขึ้น",
    type: "improvement",
    isImportant: true,
    createdAt: "2024-12-08T23:59:00Z"
  },
  {
    id: "08",
    version: "1.3.4",
    date: "2024-12-08",
    title: "อัปเดต Connection Status Component ให้ใช้ Vercel API",
    description: "เปลี่ยน Connection Status component ให้ใช้ getConfigurationStatus จาก vercel-sheets แทน google-apps-script เพื่อให้แสดงสถานะการเชื่อมต่อที่ถูกต้องสำหรับระบบ Vercel",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T23:58:00Z"
  },
  {
    id: "07",
    version: "1.3.3",
    date: "2024-12-08",
    title: "เปลี่ยนไปใช้ Vercel API โดยตรง",
    description: "อัปเดต use-sheets-data hook ให้ใช้ Vercel API โดยตรงแทนการใช้ sheets-adapter เพื่อให้ระบบทำงานกับ Vercel Serverless Functions อย่างเต็มประสิทธิภาพ ช่วยลดความซับซ้อนและเพิ่มความเสถียรของระบบ",
    type: "improvement",
    isImportant: true,
    createdAt: "2024-12-08T23:55:00Z"
  },
  {
    id: "06",
    version: "1.3.2",
    date: "2024-12-08",
    title: "เพิ่มระบบ Adaptive Sheets API",
    description: "สร้างไฟล์ sheets-adapter.ts ใหม่ที่ทำหน้าที่เป็น adapter layer ระหว่าง Google Sheets API และ Vercel API โดยจะเลือกใช้ API ที่เหมาะสมตามสภาพแวดล้อม (development/production) และการตั้งค่าที่มีอยู่ ช่วยให้ระบบทำงานได้อย่างราบรื่นในทุกสถานการณ์",
    type: "improvement",
    isImportant: true,
    createdAt: "2024-12-08T23:50:00Z"
  },
  {
    id: "05",
    version: "1.3.1",
    date: "2024-12-08",
    title: "เพิ่มระบบ Vercel Sheets Integration",
    description: "สร้างไฟล์ vercel-sheets.ts ใหม่สำหรับการเชื่อมต่อกับ Google Sheets ผ่าน Vercel API endpoints พร้อมฟังก์ชันการอ่าน เขียน และอัปเดตข้อมูลรายรับ-รายจ่าย รองรับการทำงานทั้งใน development และ production environment",
    type: "feature",
    isImportant: true,
    createdAt: "2024-12-08T23:45:00Z"
  },
  {
    id: "04",
    version: "1.3.0",
    date: "2024-12-08",
    title: "เพิ่ม googleapis package สำหรับการย้ายไป Vercel",
    description: "เพิ่ม googleapis package เวอร์ชั่น 144.0.0 เพื่อรองรับการใช้งาน Google Sheets API ในระบบ Vercel Serverless Functions ตามแผนการย้ายจาก Google Apps Script",
    type: "improvement",
    isImportant: true,
    createdAt: "2024-12-08T23:30:00Z"
  },
  {
    id: "03",
    version: "1.2.9",
    date: "2024-12-08",
    title: "แก้ไขปัญหา JSX syntax error ในหน้า Task Reminder",
    description: "แก้ไขปัญหา JSX element ที่ไม่มี closing tag ในหน้า Task Reminder ซึ่งทำให้เกิด compilation error และไม่สามารถใช้งานระบบได้",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-08T23:00:00Z"
  },
  {
    id: "02",
    version: "1.2.8",
    date: "2024-12-08",
    title: "เพิ่มฟังก์ชันทดสอบการเชื่อมต่อใน Task Reminder",
    description: "เพิ่มฟังก์ชัน handleTestConnection() ในหน้า Task Reminder เพื่อให้ผู้ใช้สามารถทดสอบการเชื่อมต่อกับ Google Apps Script ได้โดยตรง พร้อมแสดงผลการทดสอบผ่าน toast notification",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T22:00:00Z"
  },
  {
    id: "01",
    version: "1.2.7",
    date: "2024-12-08",
    title: "เพิ่มระบบ Debug และ Connection Testing สำหรับ Task Reminder",
    description: "เพิ่มฟังก์ชัน testConnection() และ console logging ใน task-api.ts เพื่อช่วยในการ debug และตรวจสอบการเชื่อมต่อกับ Google Apps Script ในระบบ Task Reminder",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T21:00:00Z"
  },
  {
    id: "00",
    version: "1.2.6",
    date: "2024-12-08",
    title: "แก้ไขปัญหา TypeScript imports ในระบบ Task Reminder",
    description: "แก้ไขปัญหาการ import types ในไฟล์ task-api.ts และเพิ่ม TaskReminder type export ในไฟล์ types หลัก เพื่อให้ระบบ Task Reminder ทำงานได้อย่างถูกต้อง",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-08T20:00:00Z"
  },
  {
    id: "0",
    version: "1.2.5",
    date: "2024-12-08",
    title: "แก้ไขปัญหาการเลือกรูปแบบวันที่ในหน้าการตั้งค่า",
    description: "แก้ไขบัคที่ทำให้ไม่สามารถเปลี่ยนรูปแบบวันที่ได้ เนื่องจากใช้ state variable ผิดตัว (settings แทน localSettings)",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-08T19:00:00Z"
  },
  {
    id: "1",
    version: "1.2.4",
    date: "2024-12-08",
    title: "แก้ไขปัญหา React Hook ในหน้าการตั้งค่า",
    description: "แก้ไขการใช้ useState แทน useEffect ที่ทำให้เกิด error ในการอัปเดต localSettings เมื่อ settings เปลี่ยนแปลง",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-08T18:00:00Z"
  },
  {
    id: "2",
    version: "1.2.3",
    date: "2024-12-08",
    title: "แก้ไขปัญหาการแก้ไขสโลแกนร้านในหน้าการตั้งค่า",
    description: "แก้ไขบัคที่ทำให้ไม่สามารถแก้ไขสโลแกนร้านได้ในหน้าการตั้งค่า เนื่องจากใช้ state ผิดตัวแปร",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-08T17:00:00Z"
  },
  {
    id: "3",
    version: "1.2.2",
    date: "2024-12-08",
    title: "เชื่อมต่อหน้าการตั้งค่ากับ Settings API",
    description: "อัปเดตหน้าการตั้งค่าให้ใช้งาน useSettings hook และเชื่อมต่อกับ Settings API สำหรับการบันทึกและโหลดการตั้งค่าจริง",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T16:00:00Z"
  },
  {
    id: "4",
    version: "1.2.1",
    date: "2024-12-08",
    title: "เพิ่มระบบจัดการการตั้งค่าแบบ Hybrid",
    description: "เพิ่ม Settings API ที่รองรับการบันทึกข้อมูลทั้งใน Google Sheets และ localStorage พร้อม fallback mechanism เพื่อให้ระบบทำงานได้แม้ไม่มีการเชื่อมต่อ Google Apps Script",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-08T15:30:00Z"
  },
  {
    id: "5",
    version: "1.2.0",
    date: "2024-12-08",
    title: "เพิ่มระบบจัดการพนักงานและการตั้งค่า",
    description: "เพิ่มหน้าจัดการพนักงาน หน้าการตั้งค่า และหน้า Update Logs สำหรับติดตามการอัพเดท",
    type: "feature",
    isImportant: true,
    createdAt: "2024-12-08T10:00:00Z"
  },
  {
    id: "6", 
    version: "1.1.5",
    date: "2024-12-05",
    title: "แก้ไขปัญหาการแสดงผลกราฟ",
    description: "แก้ไขปัญหาการแสดงผลกราฟที่ไม่ถูกต้องเมื่อมีข้อมูลน้อย",
    type: "bugfix",
    isImportant: false,
    createdAt: "2024-12-05T14:30:00Z"
  },
  {
    id: "7",
    version: "1.1.4", 
    date: "2024-12-01",
    title: "ปรับปรุงประสิทธิภาพการโหลดข้อมูล",
    description: "เพิ่มความเร็วในการโหลดข้อมูลจาก Google Sheets และปรับปรุง UI/UX",
    type: "improvement",
    isImportant: false,
    createdAt: "2024-12-01T09:15:00Z"
  }
];

const typeConfig = {
  feature: { label: "ฟีเจอร์ใหม่", icon: Plus, color: "bg-blue-500" },
  bugfix: { label: "แก้ไขบัค", icon: Wrench, color: "bg-red-500" },
  improvement: { label: "ปรับปรุง", icon: CheckCircle, color: "bg-green-500" },
  security: { label: "ความปลอดภัย", icon: Shield, color: "bg-yellow-500" }
};

export function UpdateLogs() {
  const [logs, setLogs] = useState<UpdateLog[]>(mockUpdateLogs);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<UpdateLog | null>(null);
  const [formData, setFormData] = useState({
    version: "",
    title: "",
    description: "",
    type: "feature" as UpdateLog["type"],
    isImportant: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLog: UpdateLog = {
      id: editingLog?.id || Date.now().toString(),
      ...formData,
      date: new Date().toISOString().split('T')[0],
      createdAt: editingLog?.createdAt || new Date().toISOString()
    };

    if (editingLog) {
      setLogs(logs.map(log => log.id === editingLog.id ? newLog : log));
    } else {
      setLogs([newLog, ...logs]);
    }

    // Reset form
    setFormData({
      version: "",
      title: "",
      description: "",
      type: "feature",
      isImportant: false
    });
    setIsAddDialogOpen(false);
    setEditingLog(null);
  };

  const handleEdit = (log: UpdateLog) => {
    setEditingLog(log);
    setFormData({
      version: log.version,
      title: log.title,
      description: log.description,
      type: log.type,
      isImportant: log.isImportant
    });
    setIsAddDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter(log => log.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
            Update Logs
          </h1>
          <p className="text-muted-foreground mt-1">
            ติดตามการอัพเดทและการเปลี่ยนแปลงของระบบ
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม Update Log
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingLog ? "แก้ไข Update Log" : "เพิ่ม Update Log ใหม่"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="version">เวอร์ชั่น</Label>
                  <Input
                    id="version"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    placeholder="เช่น 1.2.0"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">ประเภท</Label>
                  <Select value={formData.type} onValueChange={(value: UpdateLog["type"]) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">หัวข้อ</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="หัวข้อการอัพเดท"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">รายละเอียด</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="รายละเอียดการอัพเดท"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="important"
                  checked={formData.isImportant}
                  onCheckedChange={(checked) => setFormData({...formData, isImportant: checked})}
                />
                <Label htmlFor="important">การอัพเดทสำคัญ</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsAddDialogOpen(false);
                  setEditingLog(null);
                  setFormData({
                    version: "",
                    title: "",
                    description: "",
                    type: "feature",
                    isImportant: false
                  });
                }}>
                  ยกเลิก
                </Button>
                <Button type="submit">
                  {editingLog ? "บันทึกการแก้ไข" : "เพิ่ม Update Log"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Update Logs List */}
      <div className="space-y-4">
        {logs.map((log) => {
          const config = typeConfig[log.type];
          const Icon = config.icon;
          
          return (
            <Card key={log.id} className={`${log.isImportant ? 'ring-2 ring-rose-200 dark:ring-rose-800' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.color} text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{log.title}</CardTitle>
                        {log.isImportant && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            สำคัญ
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Tag className="h-3 w-3" />
                          เวอร์ชั่น {log.version}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(log.date)}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {config.label}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(log)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(log.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {log.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {logs.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">ยังไม่มี Update Logs</h3>
            <p className="text-muted-foreground text-center mb-4">
              เริ่มต้นบันทึกการอัพเดทและการเปลี่ยนแปลงของระบบ
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              เพิ่ม Update Log แรก
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}