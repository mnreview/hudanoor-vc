import { useState, useEffect } from 'react';
import { EmployeeCommissionReport } from '@/types/employee';
import { 
  getCommissionReports, 
  getCurrentMonthCommissionReports,
  getEmployeeCommissionReport,
  getTotalCommissions,
  getCommissionSummaryByChannel,
  CommissionReportsResponse 
} from '@/lib/vercel-commission-reports';

export const useCommissionReports = (period?: string) => {
  const [reports, setReports] = useState<EmployeeCommissionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCommissions, setTotalCommissions] = useState(0);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [reportPeriod, setReportPeriod] = useState<string>('');

  const fetchReports = async (selectedPeriod?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response: CommissionReportsResponse = selectedPeriod 
        ? await getCommissionReports(selectedPeriod)
        : await getCurrentMonthCommissionReports();
      
      setReports(response.data);
      setTotalCommissions(response.totalCommissions);
      setTotalEmployees(response.totalEmployees);
      setReportPeriod(response.period);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดรายงานคอมมิชชั่น';
      setError(errorMessage);
      console.error('Error fetching commission reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchReports(period);
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  return {
    reports,
    isLoading,
    error,
    totalCommissions,
    totalEmployees,
    reportPeriod,
    refetch,
    fetchReports
  };
};

export const useEmployeeCommissionReport = (employeeId: string, period?: string) => {
  const [report, setReport] = useState<EmployeeCommissionReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployeeReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const employeeReport = await getEmployeeCommissionReport(employeeId, period);
      setReport(employeeReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดรายงานคอมมิชชั่นพนักงาน';
      setError(errorMessage);
      console.error('Error fetching employee commission report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchEmployeeReport();
  };

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeReport();
    }
  }, [employeeId, period]);

  return {
    report,
    isLoading,
    error,
    refetch
  };
};

export const useCommissionSummary = (period?: string) => {
  const [summary, setSummary] = useState({
    storeCommissions: 0,
    onlineCommissions: 0,
    storeSales: 0,
    onlineSales: 0,
    totalCommissions: 0,
    totalSales: 0,
    period: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const summaryData = await getCommissionSummaryByChannel(period);
      setSummary(summaryData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการโหลดสรุปคอมมิชชั่น';
      setError(errorMessage);
      console.error('Error fetching commission summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchSummary();
  };

  useEffect(() => {
    fetchSummary();
  }, [period]);

  return {
    summary,
    isLoading,
    error,
    refetch
  };
};