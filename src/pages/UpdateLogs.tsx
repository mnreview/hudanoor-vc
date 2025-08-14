"use client";

import { useState } from "react";
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
import { useLogs } from "@/hooks/use-logs";
import { 
  Plus, 
  Calendar, 
  Tag, 
  AlertCircle, 
  CheckCircle, 
  Wrench, 
  Shield,
  Edit,
  Trash2,
  Loader2
} from "lucide-react";



const typeConfig = {
  feature: { label: "ฟีเจอร์ใหม่", icon: Plus, color: "bg-blue-500" },
  bugfix: { label: "แก้ไขบัค", icon: Wrench, color: "bg-red-500" },
  improvement: { label: "ปรับปรุง", icon: CheckCircle, color: "bg-green-500" },
  security: { label: "ความปลอดภัย", icon: Shield, color: "bg-yellow-500" }
};

export function UpdateLogs() {
  const {
    logs,
    isLoading,
    error,
    addLog,
    updateLog,
    deleteLog,
    isAddingLog,
    isUpdatingLog,
    isDeletingLog,
    refetch
  } = useLogs();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<UpdateLog | null>(null);
  const [formData, setFormData] = useState({
    version: "",
    title: "",
    description: "",
    type: "feature" as UpdateLog["type"],
    isImportant: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const logData = {
      version: formData.version,
      title: formData.title,
      description: formData.description,
      type: formData.type,
      date: new Date().toISOString().split('T')[0],
      isImportant: formData.isImportant
    };

    try {
      if (editingLog) {
        await updateLog({ logId: editingLog.id, updates: logData });
      } else {
        await addLog(logData);
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
    } catch (error) {
      console.error('Error submitting log:', error);
    }
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

  const handleDelete = async (id: string) => {
    try {
      await deleteLog(id);
    } catch (error) {
      console.error('Error deleting log:', error);
    }
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
                <Button type="submit" disabled={isAddingLog || isUpdatingLog}>
                  {(isAddingLog || isUpdatingLog) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    editingLog ? "บันทึกการแก้ไข" : "เพิ่ม Update Log"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">กำลังโหลด Update Logs...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">เกิดข้อผิดพลาด</h3>
            <p className="text-muted-foreground text-center mb-4">
              ไม่สามารถโหลด Update Logs ได้
            </p>
            <Button onClick={() => refetch()} variant="outline">
              ลองใหม่อีกครั้ง
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Update Logs List */}
      {!isLoading && !error && (
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
                      disabled={isDeletingLog}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isDeletingLog ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed whitespace-pre-line">
                  {log.description}
                </CardDescription>
                
                {/* Show changes if available */}
                {log.changes && Array.isArray(log.changes) && log.changes.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">การเปลี่ยนแปลง:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {log.changes.map((change, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Show technical details if available */}
                {log.technical_details && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-1">รายละเอียดทางเทคนิค:</h4>
                    <p className="text-sm text-muted-foreground">{log.technical_details}</p>
                  </div>
                )}
                
                {/* Show impact if available */}
                {log.impact && (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <h4 className="text-sm font-medium mb-1 text-blue-700 dark:text-blue-300">ผลกระทบ:</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400">{log.impact}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}

      {logs.length === 0 && !isLoading && !error && (
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