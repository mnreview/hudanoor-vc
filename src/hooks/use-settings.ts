import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSettingsData, saveSettingsData } from '@/lib/settings-api';
import { AppSettings } from '@/types/settings';
import { toast } from '@/hooks/use-toast';

const defaultSettings: AppSettings = {
  id: "default",
  storeName: "HUDANOOR",
  websiteName: "ระบบบันทึกรายรับ-รายจ่าย",
  storeSlogan: "เสื้อผ้าแฟชั่นมุสลิม",
  primaryColor: "#e11d48",
  storeAddress: "",
  storePhone: "",
  storeEmail: "",
  currency: "THB",
  dateFormat: "DD/MM/YYYY",
  defaultSalesTarget: 15000,
  incomeFormFields: [
    { id: "1", name: "product_name", label: "ชื่อสินค้า", type: "text", required: true, order: 1, isVisible: true },
    { id: "2", name: "product_category", label: "หมวดหมู่สินค้า", type: "select", required: true, options: ["เสื้อ", "กางเกง", "ผ้าคลุม", "อุปกรณ์เสริม"], order: 2, isVisible: true },
    { id: "3", name: "quantity", label: "จำนวน", type: "number", required: true, order: 3, isVisible: true },
    { id: "4", name: "amount", label: "ราคา", type: "number", required: true, order: 4, isVisible: true },
    { id: "5", name: "channel", label: "ช่องทางขาย", type: "select", required: true, options: ["store", "online"], order: 5, isVisible: true },
    { id: "6", name: "branch_or_platform", label: "สาขา/แพลตฟอร์ม", type: "text", required: true, order: 6, isVisible: true },
    { id: "7", name: "note", label: "หมายเหตุ", type: "textarea", required: false, order: 7, isVisible: true }
  ],
  expenseFormFields: [
    { id: "1", name: "expense_item", label: "รายการค่าใช้จ่าย", type: "text", required: true, order: 1, isVisible: true },
    { id: "2", name: "expense_category", label: "หมวดหมู่ค่าใช้จ่าย", type: "select", required: true, options: ["วัตถุดิบ", "ค่าเช่า", "ค่าไฟฟ้า", "ค่าน้ำ", "เงินเดือน", "การตลาด", "อื่นๆ"], order: 2, isVisible: true },
    { id: "3", name: "cost", label: "จำนวนเงิน", type: "number", required: true, order: 3, isVisible: true },
    { id: "4", name: "channel", label: "ช่องทาง", type: "select", required: true, options: ["store", "online"], order: 4, isVisible: true },
    { id: "5", name: "branch_or_platform", label: "สาขา/แพลตฟอร์ม", type: "text", required: true, order: 5, isVisible: true },
    { id: "6", name: "note", label: "หมายเหตุ", type: "textarea", required: false, order: 6, isVisible: true }
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

export const useSettings = () => {
  const queryClient = useQueryClient();

  const {
    data: settings = defaultSettings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const data = await getSettingsData();
      return data || defaultSettings;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  const saveSettingsMutation = useMutation({
    mutationFn: saveSettingsData,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['settings'] });
      await refetch();
      
      toast({
        title: "บันทึกการตั้งค่าสำเร็จ",
        description: "การตั้งค่าของคุณได้รับการบันทึกแล้ว",
        duration: 3000,
      });
    },
    onError: (error) => {
      console.error('Error saving settings:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถบันทึกการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  return {
    settings,
    isLoading,
    error,
    refetch,
    saveSettings: saveSettingsMutation.mutate,
    isSaving: saveSettingsMutation.isPending
  };
};