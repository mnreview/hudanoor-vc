import { Income, Expense } from '@/types';

// Import both implementations
import * as GoogleSheetsAPI from './google-sheets';
import * as VercelSheetsAPI from './vercel-sheets';

// Check if we're in development mode or if Google Sheets is configured
const isGoogleSheetsConfigured = () => {
  const spreadsheetId = import.meta.env.VITE_GOOGLE_SHEETS_ID;
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  return !!(spreadsheetId && apiKey);
};

// Always use Vercel API now (migration complete)
const shouldUseVercelAPI = () => {
  return true; // Always use Vercel API
};

// Adaptive functions that choose the right implementation
export const getIncomeData = async (): Promise<Income[]> => {
  try {
    if (shouldUseVercelAPI()) {
      console.log('Using Vercel API for income data');
      return await VercelSheetsAPI.getIncomeData();
    } else {
      console.log('Using Google Sheets API for income data');
      return await GoogleSheetsAPI.getIncomeData();
    }
  } catch (error) {
    console.error('Error in getIncomeData:', error);
    // Fallback to empty array with mock data structure
    return [];
  }
};

export const getExpenseData = async (): Promise<Expense[]> => {
  try {
    if (shouldUseVercelAPI()) {
      console.log('Using Vercel API for expense data');
      return await VercelSheetsAPI.getExpenseData();
    } else {
      console.log('Using Google Sheets API for expense data');
      return await GoogleSheetsAPI.getExpenseData();
    }
  } catch (error) {
    console.error('Error in getExpenseData:', error);
    // Fallback to empty array
    return [];
  }
};

export const addIncomeRecord = async (income: Omit<Income, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    if (shouldUseVercelAPI()) {
      console.log('Using Vercel API to add income record');
      return await VercelSheetsAPI.addIncomeRecord(income);
    } else {
      console.log('Using Google Sheets API to add income record');
      return await GoogleSheetsAPI.addIncomeRecord(income);
    }
  } catch (error) {
    console.error('Error in addIncomeRecord:', error);
    throw error;
  }
};

export const addExpenseRecord = async (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    if (shouldUseVercelAPI()) {
      console.log('Using Vercel API to add expense record');
      return await VercelSheetsAPI.addExpenseRecord(expense);
    } else {
      console.log('Using Google Sheets API to add expense record');
      return await GoogleSheetsAPI.addExpenseRecord(expense);
    }
  } catch (error) {
    console.error('Error in addExpenseRecord:', error);
    throw error;
  }
};

export const initializeSheets = async (): Promise<void> => {
  try {
    if (shouldUseVercelAPI()) {
      console.log('Using Vercel API to initialize sheets');
      return await VercelSheetsAPI.initializeSheets();
    } else {
      console.log('Using Google Sheets API to initialize sheets');
      return await GoogleSheetsAPI.initializeSheets();
    }
  } catch (error) {
    console.error('Error in initializeSheets:', error);
    throw error;
  }
};

export const getConfigurationStatus = () => {
  const googleSheetsStatus = GoogleSheetsAPI.getConfigurationStatus();
  const vercelStatus = VercelSheetsAPI.getConfigurationStatus();
  
  return {
    currentMode: shouldUseVercelAPI() ? 'vercel' : 'google-sheets',
    googleSheets: googleSheetsStatus,
    vercel: vercelStatus,
    isConfigured: shouldUseVercelAPI() ? true : googleSheetsStatus.isConfigured
  };
};