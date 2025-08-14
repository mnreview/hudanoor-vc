import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateLog } from '@/types/settings';
import { toast } from '@/hooks/use-toast';

// Local API functions for JSON-based logs
const getLogsData = async (): Promise<UpdateLog[]> => {
  const response = await fetch('/api/logs');
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to fetch logs');
  }
  
  return result.data || [];
};

const addLogRecord = async (logData: Partial<UpdateLog>): Promise<any> => {
  const response = await fetch('/api/logs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ log: logData }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to add log');
  }
  
  return result;
};

const updateLogRecord = async (logId: string, updates: Partial<UpdateLog>): Promise<any> => {
  const response = await fetch('/api/logs', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ logId, updates }),
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to update log');
  }
  
  return result;
};

const deleteLogRecord = async (logId: string): Promise<any> => {
  const response = await fetch(`/api/logs?logId=${logId}`, {
    method: 'DELETE',
  });

  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || 'Failed to delete log');
  }
  
  return result;
};

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
        description: "บันทึกข้อมูลในระบบแล้ว"
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
        description: "ลบรายการออกจากระบบแล้ว"
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