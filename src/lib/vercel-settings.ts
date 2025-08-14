// API base URL - automatically detects environment
const API_BASE = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api')
  : '/api';

// Helper function to convert sheet data to settings object
const parseSettingsData = (rows: any[][]): Record<string, any> => {
  if (!rows || rows.length <= 1) return {};
  
  const settings: Record<string, any> = {};
  
  // Skip header row
  rows.slice(1).forEach(row => {
    const key = row[0];
    const value = row[1];
    
    if (key && value !== undefined) {
      try {
        settings[key] = JSON.parse(value);
      } catch {
        settings[key] = value;
      }
    }
  });
  
  return settings;
};

// Default settings
const defaultSettings = {
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
  channels: ["หน้าร้าน", "ออนไลน์"],
  branches: ["สาขาหลัก"],
  productCategories: ["เสื้อผ้า", "อุปกรณ์", "อื่นๆ"],
  expenseCategories: ["ค่าเช่า", "ค่าไฟ", "วัตถุดิบ", "อื่นๆ"]
};

// Read settings data from Google Sheets via Vercel API
export const getSettingsData = async (): Promise<Record<string, any>> => {
  try {
    const response = await fetch(`${API_BASE}/settings`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const settings = parseSettingsData(data.data || []);
    
    // Merge with default settings
    return { ...defaultSettings, ...settings };
  } catch (error) {
    console.error('Error fetching settings data:', error);
    // Return default settings if there's an error
    return defaultSettings;
  }
};

// Save setting via Vercel API
export const saveSetting = async (key: string, value: any, description?: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key, value, description })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Setting saved successfully via Vercel API');
  } catch (error) {
    console.error('Error saving setting:', error);
    throw error;
  }
};

// Save multiple settings at once
export const saveSettings = async (settings: Record<string, any>): Promise<void> => {
  try {
    const promises = Object.entries(settings).map(([key, value]) => 
      saveSetting(key, value, `Setting for ${key}`)
    );
    
    await Promise.all(promises);
    console.log('All settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    throw error;
  }
};