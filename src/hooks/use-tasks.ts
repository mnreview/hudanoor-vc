import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTasksData, 
  addTaskRecord, 
  updateTaskRecord, 
  deleteTaskRecord 
} from '@/lib/task-api';
import { TaskReminder } from '@/types/task';
import { toast } from '@/hooks/use-toast';

export const useTasks = () => {
  const queryClient = useQueryClient();

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['tasks'],
    queryFn: getTasksData,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false
  });

  const addTaskMutation = useMutation({
    mutationFn: addTaskRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await refetch();
      
      toast({
        title: "เพิ่ม Task สำเร็จ",
        description: "บันทึกข้อมูลลง Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error adding task:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่ม Task ได้",
        variant: "destructive"
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<TaskReminder> }) => 
      updateTaskRecord(taskId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await refetch();
      
      toast({
        title: "อัปเดต Task สำเร็จ",
        description: "บันทึกการเปลี่ยนแปลงแล้ว"
      });
    },
    onError: (error) => {
      console.error('Error updating task:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดต Task ได้",
        variant: "destructive"
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTaskRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      await refetch();
      
      toast({
        title: "ลบ Task สำเร็จ",
        description: "ลบรายการออกจาก Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error deleting task:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบ Task ได้",
        variant: "destructive"
      });
    }
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    addTask: addTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isAddingTask: addTaskMutation.isPending,
    isUpdatingTask: updateTaskMutation.isPending,
    isDeletingTask: deleteTaskMutation.isPending
  };
};