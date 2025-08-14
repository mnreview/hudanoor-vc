import { AppSettings } from '@/types/settings';

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

// Helper function to convert sheet data to AppSettings object
const parseSettingsData = (rows: any[][]): AppSettings | null => {
  if (!rows || rows.length <= 1) return null;
  
  // หาแถวที่มี ID = 'default'
  const settingsRow = rows.find(row => row[0] === 'default');
  if (!settingsRow) return null;
  
  return {
    id: settingsRow[0],
    storeName: settingsRow[1] || 'HUDANOOR',
    websiteName: settingsRow[2] || 'ระบบบันทึกรายรับ-รายจ่าย',
    storeSlogan: settingsRow[3] || 'เสื้อผ้าแฟชั่นมุสลิม',
    primaryColor: settingsRow[4] || '#e11d48',
    storeAddress: settingsRow[5] || '',
    storePhone: settingsRow[6] || '',
    storeEmail: settingsRow[7] || '',
    currency: settingsRow[8] || 'THB',
    dateFormat: settingsRow[9] || 'DD/MM/YYYY',
    defaultSalesTarget: parseFloat(settingsRow[10]) || 200000,
    incomeFormFields: [], // จะเพิ่มในอนาคต
    expenseFormFields: [], // จะเพิ่มในอนาคต
    createdAt: settingsRow[11] || new Date().toISOString(),
    updatedAt: settingsRow[12] || new Date().toISOString()
  };
};

// Read settings data from Google Apps Script
export const getSettingsData = async (): Promise<AppSettings | null> => {
  if (!isGoogleAppsScriptConfigured()) {
    // Fallback to localStorage
    try {
      const savedSettings = localStorage.getItem('hudanoor-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return null;
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      return null;
    }
  }

  try {
    const data = await fetchWithJsonp(`${WEB_APP_URL}?action=getSettings`);
    const settings = parseSettingsData(data.values || []);
    
    // บันทึกลง localStorage เป็น backup
    if (settings) {
      localStorage.setItem('hudanoor-settings', JSON.stringify(settings));
    }
    
    return settings;
  } catch (error) {
    console.error('Error fetching settings data:', error);
    
    // Fallback to localStorage
    try {
      const savedSettings = localStorage.getItem('hudanoor-settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
      return null;
    } catch (localError) {
      console.error('Error loading settings from localStorage:', localError);
      return null;
    }
  }
};

// Save settings data to Google Apps Script
export const saveSettingsData = async (settings: Partial<AppSettings>): Promise<void> => {
  // บันทึกลง localStorage ก่อนเสมอ
  try {
    const currentSettings = localStorage.getItem('hudanoor-settings');
    const updatedSettings = currentSettings 
      ? { ...JSON.parse(currentSettings), ...settings, updatedAt: new Date().toISOString() }
      : { ...settings, id: 'default', updatedAt: new Date().toISOString() };
    
    localStorage.setItem('hudanoor-settings', JSON.stringify(updatedSettings));
  } catch (error) {
    console.error('Error saving settings to localStorage:', error);
  }

  if (!isGoogleAppsScriptConfigured()) {
    console.log('Settings saved to localStorage only (Google Apps Script not configured)');
    return;
  }

  try {
    const params = new URLSearchParams({
      action: 'saveSettings',
      data: JSON.stringify(settings)
    });
    
    await fetchWithJsonp(`${WEB_APP_URL}?${params.toString()}`);
    console.log('Settings saved successfully to Google Sheets');
  } catch (error) {
    console.error('Error saving settings to Google Sheets:', error);
    console.log('Settings saved to localStorage as fallback');
    // ไม่ throw error เพราะได้บันทึกลง localStorage แล้ว
  }
};