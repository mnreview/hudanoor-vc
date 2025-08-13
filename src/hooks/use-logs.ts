import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getLogsData, 
  addLogRecord, 
  updateLogRecord, 
  deleteLogRecord 
} from '@/lib/vercel-logs';
import { UpdateLog } from '@/types/settings';
import { toast } from '@/hooks/use-toast';

export const useLogs = () => {
  const queryClient = useQueryClient();

  const {
    data: logs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['logs'],
    queryFn: getLogsData,
    staleTime: 30 * 1000, // 30 seconds
    retry: 1,
    refetchOnWindowFocus: false
  });

  const addLogMutation = useMutation({
    mutationFn: addLogRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['logs'] });
      await refetch();
      
      toast({
        title: "เพิ่ม Update Log สำเร็จ",
        description: "บันทึกข้อมูลลง Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error adding log:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่ม Update Log ได้",
        variant: "destructive"
      });
    }
  });

  const updateLogMutation = useMutation({
    mutationFn: ({ logId, updates }: { logId: string; updates: Partial<UpdateLog> }) => 
      updateLogRecord(logId, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['logs'] });
      await refetch();
      
      toast({
        title: "อัปเดต Update Log สำเร็จ",
        description: "บันทึกการเปลี่ยนแปลงแล้ว"
      });
    },
    onError: (error) => {
      console.error('Error updating log:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถอัปเดต Update Log ได้",
        variant: "destructive"
      });
    }
  });

  const deleteLogMutation = useMutation({
    mutationFn: deleteLogRecord,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['logs'] });
      await refetch();
      
      toast({
        title: "ลบ Update Log สำเร็จ",
        description: "ลบรายการออกจาก Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error deleting log:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถลบ Update Log ได้",
        variant: "destructive"
      });
    }
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
    addLog: addLogMutation.mutate,
    updateLog: updateLogMutation.mutate,
    deleteLog: deleteLogMutation.mutate,
    isAddingLog: addLogMutation.isPending,
    isUpdatingLog: updateLogMutation.isPending,
    isDeletingLog: deleteLogMutation.isPending
  };
};