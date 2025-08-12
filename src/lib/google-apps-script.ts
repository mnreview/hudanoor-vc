import { Income, Expense } from '@/types';

// Google Apps Script Web App URL
const WEB_APP_URL = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_URL || '';

// Check if Google Apps Script is configured
const isGoogleAppsScriptConfigured = () => {
  return !!WEB_APP_URL;
};

// JSONP helper function to bypass CORS
const fetchWithJsonp = (url: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const callbackName = `jsonp_callback_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const script = document.createElement('script');
    
    // Set up global callback
    (window as any)[callbackName] = (data: any) => {
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      resolve(data);
    };
    
    // Handle errors
    script.onerror = () => {
      document.head.removeChild(script);
      delete (window as any)[callbackName];
      reject(new Error('JSONP request failed'));
    };
    
    // Add callback parameter to URL
    const separator = url.includes('?') ? '&' : '?';
    script.src = `${url}${separator}callback=${callbackName}`;
    
    document.head.appendChild(script);
    
    // Timeout after 10 seconds
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        document.head.removeChild(script);
        delete (window as any)[callbackName];
        reject(new Error('JSONP request timeout'));
      }
    }, 10000);
  });
};

// Helper function to convert sheet data to Income objects
const parseIncomeData = (rows: any[][]): Income[] => {
  if (!rows || rows.length <= 1) return [];
  
  // Skip header row
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `income_${index + 1}`,
    date: row[1] || new Date().toISOString(),
    channel: row[2] || 'store',
    branch_or_platform: row[3] || '',
    product_name: row[4] || '',
    product_category: row[5] || '',
    quantity: parseInt(row[6]) || 0,
    amount: parseFloat(row[7]) || 0,
    note: row[8] || '',
    createdAt: row[9] || new Date().toISOString(),
    updatedAt: row[10] || new Date().toISOString()
  }));
};

// Helper function to convert sheet data to Expense objects
const parseExpenseData = (rows: any[][]): Expense[] => {
  if (!rows || rows.length <= 1) return [];
  
  // Skip header row
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `expense_${index + 1}`,
    date: row[1] || new Date().toISOString(),
    channel: row[2] || 'store',
    branch_or_platform: row[3] || '',
    expense_item: row[4] || '',
    expense_category: row[5] || '',
    cost: parseFloat(row[6]) || 0,
    note: row[7] || '',
    createdAt: row[8] || new Date().toISOString(),
    updatedAt: row[9] || new Date().toISOString()
  }));
};

// Read income data from Google Apps Script using JSONP
export const getIncomeData = async (): Promise<Income[]> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const data = await fetchWithJsonp(`${WEB_APP_URL}?action=getIncome`);
    return parseIncomeData(data.values || []);
  } catch (error) {
    console.error('Error fetching income data:', error);
    throw error;
  }
};

// Read expense data from Google Apps Script using JSONP
export const getExpenseData = async (): Promise<Expense[]> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const data = await fetchWithJsonp(`${WEB_APP_URL}?action=getExpense`);
    return parseExpenseData(data.values || []);
  } catch (error) {
    console.error('Error fetching expense data:', error);
    throw error;
  }
};

// Add new income record using JSONP
export const addIncomeRecord = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const params = new URLSearchParams({
      action: 'addIncome',
      data: JSON.stringify(income)
    });
    
    await fetchWithJsonp(`${WEB_APP_URL}?${params.toString()}`);
    console.log('Income record added successfully via Google Apps Script');
  } catch (error) {
    console.error('Error adding income record:', error);
    throw error;
  }
};

// Add new expense record using JSONP
export const addExpenseRecord = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const params = new URLSearchParams({
      action: 'addExpense',
      data: JSON.stringify(expense)
    });
    
    await fetchWithJsonp(`${WEB_APP_URL}?${params.toString()}`);
    console.log('Expense record added successfully via Google Apps Script');
  } catch (error) {
    console.error('Error adding expense record:', error);
    throw error;
  }
};

// Initialize sheets with headers using JSONP
export const initializeSheets = async (): Promise<void> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    await fetchWithJsonp(`${WEB_APP_URL}?action=initializeSheets`);
    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw error;
  }
};

// Export configuration status
export const getConfigurationStatus = () => {
  return {
    isConfigured: isGoogleAppsScriptConfigured(),
    hasWebAppUrl: !!WEB_APP_URL
  };
};