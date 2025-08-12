"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, CheckSquare } from "lucide-react";
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns";
import { th } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { useTasks } from "@/hooks/use-tasks";
import { TaskReminder as TaskReminderType } from "@/types/task";
import { testConnection } from "@/lib/task-api";

export function TaskReminder() {
  const { 
    tasks, 
    isLoading, 
    addTask, 
    updateTask, 
    deleteTask,
    isAddingTask,
    isUpdatingTask,
    isDeletingTask
  } = useTasks();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    type: 'expense' as 'income' | 'expense',
    amount: 0,
    note: '',
    dueDate: new Date(),
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.amount) {
      toast({
        title: "ข้อผิดพลาด",
        description: "กรุณากรอกข้อมูลให้ครบถ้วน",
        variant: "destructive"
      });
      return;
    }

    addTask({
      title: newTask.title,
      type: newTask.type,
      amount: newTask.amount,
      note: newTask.note,
      dueDate: newTask.dueDate,
      completed: false,
    });

    setNewTask({
      title: '',
      type: 'expense',
      amount: 0,
      note: '',
      dueDate: new Date(),
    });
    setIsAddDialogOpen(false);
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      updateTask({ taskId, updates: { completed: !task.completed } });
    }
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(taskId);
  };

  const handleTestConnection = async () => {
    try {
      const isConnected = await testConnection();
      if (isConnected) {
        toast({
          title: "เชื่อมต่อสำเร็จ",
          description: "สามารถเชื่อมต่อกับ Google Apps Script ได้",
        });
      } else {
        toast({
          title: "เชื่อมต่อไม่สำเร็จ",
          description: "ไม่สามารถเชื่อมต่อกับ Google Apps Script ได้",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถทดสอบการเชื่อมต่อได้",
        variant: "destructive"
      });
    }
  };

  // Sort tasks by due date (nearest first) and completion status
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // Completed tasks go to bottom
    }
    return a.dueDate.getTime() - b.dueDate.getTime();
  });

  const getTaskStatus = (task: TaskReminderType) => {
    if (task.completed) return { label: 'เสร็จแล้ว', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
    if (isPast(task.dueDate) && !isToday(task.dueDate)) return { label: 'เกินกำหนด', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
    if (isToday(task.dueDate)) return { label: 'วันนี้', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' };
    if (isTomorrow(task.dueDate)) return { label: 'พรุ่งนี้', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
    
    const daysLeft = differenceInDays(task.dueDate, new Date());
    if (daysLeft <= 7) return { label: `อีก ${daysLeft} วัน`, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' };
    
    return { label: format(task.dueDate, 'dd MMM', { locale: th }), color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Task Reminder
          </h1>
          <p className="text-muted-foreground">จัดการรายการที่ต้องทำในอนาคต</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleTestConnection}
            variant="outline"
            size="sm"
          >
            ทดสอบการเชื่อมต่อ
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่ม Task
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>เพิ่ม Task ใหม่</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">รายการ *</Label>
                <Input
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="เช่น จ่ายค่าเช่าร้าน"
                />
              </div>

              <div>
                <Label htmlFor="type">ประเภท *</Label>
                <Select value={newTask.type} onValueChange={(value: 'income' | 'expense') => setNewTask(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">รายรับ</SelectItem>
                    <SelectItem value="expense">รายจ่าย</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">จำนวนเงิน (บาท) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newTask.amount || ''}
                  onChange={(e) => setNewTask(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="dueDate">กำหนดวัน *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !newTask.dueDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newTask.dueDate ? format(newTask.dueDate, 'dd MMMM yyyy', { locale: th }) : "เลือกวันที่"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newTask.dueDate}
                      onSelect={(date) => date && setNewTask(prev => ({ ...prev, dueDate: date }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="note">หมายเหตุ</Label>
                <Textarea
                  id="note"
                  value={newTask.note}
                  onChange={(e) => setNewTask(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="รายละเอียดเพิ่มเติม"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button onClick={handleAddTask} disabled={isAddingTask}>
                  {isAddingTask ? 'กำลังเพิ่ม...' : 'เพิ่ม Task'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </CardContent>
          </Card>
        ) : sortedTasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                ยังไม่มี Task
              </h3>
              <p className="text-muted-foreground text-center mb-4">
                เพิ่ม Task เพื่อจัดการรายการที่ต้องทำในอนาคต
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่ม Task แรก
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedTasks.map((task) => {
            const status = getTaskStatus(task);
            return (
              <Card key={task.id} className={cn(
                "transition-all duration-200",
                task.completed ? "opacity-60" : "hover:shadow-md"
              )}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      disabled={isUpdatingTask}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className={cn(
                            "font-semibold",
                            task.completed && "line-through text-muted-foreground"
                          )}>
                            {task.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={task.type === 'income' ? 'default' : 'secondary'}>
                              {task.type === 'income' ? 'รายรับ' : 'รายจ่าย'}
                            </Badge>
                            <span className="text-sm font-medium">
                              {task.amount.toLocaleString()} บาท
                            </span>
                          </div>
                          {task.note && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {task.note}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={status.color}>
                            {status.label}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isDeletingTask}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            {isDeletingTask ? 'กำลังลบ...' : 'ลบ'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}