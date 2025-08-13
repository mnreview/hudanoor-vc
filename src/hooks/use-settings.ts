import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getSettingsData, 
  saveSetting,
  saveSettings 
} from '@/lib/vercel-settings';
import { toast } from '@/hooks/use-toast';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const {
    data: settings = {},
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettingsData,
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
    refetchOnWindowFocus: false
  });

  const saveSettingMutation = useMutation({
    mutationFn: ({ key, value, description }: { key: string; value: any; description?: string }) => 
      saveSetting(key, value, description),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await refetch();
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "บันทึกข้อมูลลง Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error saving setting:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    }
  });

  const saveSettingsMutation = useMutation({
    mutationFn: saveSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await refetch();
      
      toast({
        title: "บันทึกการตั้งค่าทั้งหมดสำเร็จ",
        description: "บันทึกข้อมูลลง Google Sheets แล้ว"
      });
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้",
        variant: "destructive"
      });
    }
  });

  return {
    settings,
    isLoading,
    error,
    refetch,
    saveSetting: saveSettingMutation.mutate,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingMutation.isPending || saveSettingsMutation.isPending
  };
};