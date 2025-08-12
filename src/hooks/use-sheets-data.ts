import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getIncomeData, 
  getExpenseData, 
  addIncomeRecord, 
  addExpenseRecord 
} from '@/lib/google-apps-script';
import { Income, Expense } from '@/types';
import { toast } from '@/hooks/use-toast';

// Hook for managing income data
export const useIncomeData = () => {
  const queryClient = useQueryClient();

  const {
    data: incomeData = [],
    isLoading: isLoadingIncome,
    error: incomeError,
    refetch: refetchIncome
  } = useQuery({
    queryKey: ['income'],
    queryFn: getIncomeData,
    staleTime: 30 * 1000, // 30 seconds - shorter for faster updates
    retry: 1,
    refetchOnWindowFocus: false
  });

  const addIncomeMutation = useMutation({
    mutationFn: addIncomeRecord,
    onSuccess: async () => {
      // Invalidate และ refetch ข้อมูลทันที
      await queryClient.invalidateQueries({ queryKey: ['income'] });
      await refetchIncome();
      
      toast({
        title: "เพิ่มรายรับสำเร็จ",
        description: "บันทึกข้อมูลแล้ว"
      });
    },
    onError: (error) => {
      console.error('Error adding income:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มรายรับได้",
        variant: "destructive"
      });
    }
  });

  return {
    incomeData,
    isLoadingIncome,
    incomeError,
    refetchIncome,
    addIncome: addIncomeMutation.mutate,
    isAddingIncome: addIncomeMutation.isPending
  };
};

// Hook for managing expense data
export const useExpenseData = () => {
  const queryClient = useQueryClient();

  const {
    data: expenseData = [],
    isLoading: isLoadingExpense,
    error: expenseError,
    refetch: refetchExpense
  } = useQuery({
    queryKey: ['expense'],
    queryFn: getExpenseData,
    staleTime: 30 * 1000, // 30 seconds - shorter for faster updates
    retry: 1,
    refetchOnWindowFocus: false
  });

  const addExpenseMutation = useMutation({
    mutationFn: addExpenseRecord,
    onSuccess: async () => {
      // Invalidate และ refetch ข้อมูลทันที
      await queryClient.invalidateQueries({ queryKey: ['expense'] });
      await refetchExpense();
      
      toast({
        title: "เพิ่มรายจ่ายสำเร็จ",
        description: "บันทึกข้อมูลแล้ว"
      });
    },
    onError: (error) => {
      console.error('Error adding expense:', error);
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถเพิ่มรายจ่ายได้",
        variant: "destructive"
      });
    }
  });

  return {
    expenseData,
    isLoadingExpense,
    expenseError,
    refetchExpense,
    addExpense: addExpenseMutation.mutate,
    isAddingExpense: addExpenseMutation.isPending
  };
};

// Combined hook for both income and expense data
export const useSheetsData = () => {
  const incomeHook = useIncomeData();
  const expenseHook = useExpenseData();

  const isLoading = incomeHook.isLoadingIncome || expenseHook.isLoadingExpense;
  const hasError = incomeHook.incomeError || expenseHook.expenseError;

  const refetchAll = async () => {
    await Promise.all([
      incomeHook.refetchIncome(),
      expenseHook.refetchExpense()
    ]);
  };

  // Enhanced add functions that refetch both datasets
  const addIncomeWithRefresh = async (income: any) => {
    await incomeHook.addIncome(income);
    // Refetch both income and expense data to update all calculations
    setTimeout(async () => {
      await refetchAll();
    }, 1000); // Wait 1 second for Google Sheets to process
  };

  const addExpenseWithRefresh = async (expense: any) => {
    await expenseHook.addExpense(expense);
    // Refetch both income and expense data to update all calculations
    setTimeout(async () => {
      await refetchAll();
    }, 1000); // Wait 1 second for Google Sheets to process
  };

  return {
    ...incomeHook,
    ...expenseHook,
    isLoading,
    hasError,
    refetchAll,
    addIncome: addIncomeWithRefresh,
    addExpense: addExpenseWithRefresh
  };
};