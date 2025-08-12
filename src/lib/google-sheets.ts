import { Income, Expense } from '@/types';

// Google Sheets configuration
const SPREADSHEET_ID = import.meta.env.VITE_GOOGLE_SHEETS_ID || '';
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || '';

// Sheet names
const INCOME_SHEET = 'รายรับ';
const EXPENSE_SHEET = 'รายจ่าย';

// Base URL for Google Sheets API
const BASE_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

// Check if Google Sheets is configured
const isGoogleSheetsConfigured = () => {
  return !!(SPREADSHEET_ID && API_KEY);
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

// Read income data from Google Sheets
export const getIncomeData = async (): Promise<Income[]> => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตั้งค่า SPREADSHEET_ID และ API_KEY');
  }

  try {
    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(INCOME_SHEET)}!A:K?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return parseIncomeData(data.values || []);
  } catch (error) {
    console.error('Error fetching income data:', error);
    throw error;
  }
};

// Read expense data from Google Sheets
export const getExpenseData = async (): Promise<Expense[]> => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตั้งค่า SPREADSHEET_ID และ API_KEY');
  }

  try {
    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(EXPENSE_SHEET)}!A:J?key=${API_KEY}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    
    const data = await response.json();
    return parseExpenseData(data.values || []);
  } catch (error) {
    console.error('Error fetching expense data:', error);
    throw error;
  }
};

// Add new income record
export const addIncomeRecord = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตั้งค่า SPREADSHEET_ID และ API_KEY');
  }

  try {
    const id = `income_${Date.now()}`;
    const now = new Date().toISOString();
    
    const values = [[
      id,
      income.date,
      income.channel,
      income.branch_or_platform,
      income.product_name,
      income.product_category,
      income.quantity,
      income.amount,
      income.note || '',
      now,
      now
    ]];

    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(INCOME_SHEET)}!A:K:append?valueInputOption=RAW&key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log('Income record added successfully to Google Sheets');
  } catch (error) {
    console.error('Error adding income record:', error);
    throw error;
  }
};

// Add new expense record
export const addExpenseRecord = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตั้งค่า SPREADSHEET_ID และ API_KEY');
  }

  try {
    const id = `expense_${Date.now()}`;
    const now = new Date().toISOString();
    
    const values = [[
      id,
      expense.date,
      expense.channel,
      expense.branch_or_platform,
      expense.expense_item,
      expense.expense_category,
      expense.cost,
      expense.note || '',
      now,
      now
    ]];

    const url = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(EXPENSE_SHEET)}!A:J:append?valueInputOption=RAW&key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    console.log('Expense record added successfully to Google Sheets');
  } catch (error) {
    console.error('Error adding expense record:', error);
    throw error;
  }
};

// Initialize sheets with headers if they don't exist
export const initializeSheets = async (): Promise<void> => {
  if (!isGoogleSheetsConfigured()) {
    throw new Error('Google Sheets ยังไม่ได้ตั้งค่า กรุณาตั้งค่า SPREADSHEET_ID และ API_KEY');
  }

  try {
    // Income sheet headers
    const incomeHeaders = [
      'ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'ชื่อสินค้า', 
      'หมวดหมู่สินค้า', 'จำนวน', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
    ];

    // Expense sheet headers
    const expenseHeaders = [
      'ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'รายการค่าใช้จ่าย', 
      'หมวดหมู่ค่าใช้จ่าย', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
    ];

    // Add headers to income sheet
    const incomeUrl = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(INCOME_SHEET)}!A1:K1?valueInputOption=RAW&key=${API_KEY}`;
    await fetch(incomeUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [incomeHeaders]
      })
    });

    // Add headers to expense sheet
    const expenseUrl = `${BASE_URL}/${SPREADSHEET_ID}/values/${encodeURIComponent(EXPENSE_SHEET)}!A1:J1?valueInputOption=RAW&key=${API_KEY}`;
    await fetch(expenseUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [expenseHeaders]
      })
    });

    console.log('Google Sheets initialized successfully');
  } catch (error) {
    console.error('Error initializing sheets:', error);
    throw new Error('Failed to initialize Google Sheets');
  }
};

// Export configuration status
export const getConfigurationStatus = () => {
  return {
    isConfigured: isGoogleSheetsConfigured(),
    hasSpreadsheetId: !!SPREADSHEET_ID,
    hasApiKey: !!API_KEY
  };
};