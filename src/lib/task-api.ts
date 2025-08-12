import { TaskReminder } from '@/types';

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

// Helper function to convert sheet data to TaskReminder objects
const parseTaskData = (rows: any[][]): TaskReminder[] => {
  if (!rows || rows.length <= 1) return [];
  
  // Skip header row
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `task_${index + 1}`,
    title: row[1] || '',
    type: (row[2] || 'expense') as 'income' | 'expense',
    amount: parseFloat(row[3]) || 0,
    note: row[4] || '',
    dueDate: new Date(row[5] || new Date()),
    completed: row[6] === 'เสร็จแล้ว',
    createdAt: new Date(row[7] || new Date()),
  }));
};

// Test connection to Google Apps Script
export const testConnection = async (): Promise<boolean> => {
  if (!isGoogleAppsScriptConfigured()) {
    console.error('Google Apps Script Web App URL not configured');
    return false;
  }

  try {
    console.log('Testing connection to:', WEB_APP_URL);
    const data = await fetchWithJsonp(`${WEB_APP_URL}?action=getTasks`);
    console.log('Connection test successful:', data);
    return true;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Read tasks data from Google Apps Script using JSONP
export const getTasksData = async (): Promise<TaskReminder[]> => {
  console.log('getTasksData called');
  console.log('WEB_APP_URL configured:', isGoogleAppsScriptConfigured());
  
  if (!isGoogleAppsScriptConfigured()) {
    console.error('Google Apps Script Web App URL not configured');
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    console.log('Fetching tasks from:', `${WEB_APP_URL}?action=getTasks`);
    const data = await fetchWithJsonp(`${WEB_APP_URL}?action=getTasks`);
    console.log('Raw data from Google Apps Script:', data);
    const tasks = parseTaskData(data.values || []);
    console.log('Parsed tasks:', tasks);
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks data:', error);
    throw error;
  }
};

// Add new task record to Google Sheets
export const addTaskRecord = async (task: Omit<TaskReminder, 'id' | 'createdAt'>): Promise<void> => {
  console.log('addTaskRecord called with:', task);
  console.log('WEB_APP_URL:', WEB_APP_URL);
  
  if (!isGoogleAppsScriptConfigured()) {
    console.error('Google Apps Script Web App URL not configured');
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const taskData = {
      title: task.title,
      type: task.type,
      amount: task.amount,
      note: task.note,
      dueDate: task.dueDate.toISOString(),
      completed: task.completed
    };

    console.log('Sending task data:', taskData);

    const params = new URLSearchParams({
      action: 'addTask',
      data: JSON.stringify(taskData)
    });
    
    const url = `${WEB_APP_URL}?${params.toString()}`;
    console.log('Request URL:', url);
    
    const result = await fetchWithJsonp(url);
    console.log('Response from Google Apps Script:', result);
    console.log('Task added successfully via Google Apps Script');
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update task (for status changes or edits)
export const updateTaskRecord = async (taskId: string, updates: Partial<TaskReminder>): Promise<void> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const updateData: any = { id: taskId };
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.note !== undefined) updateData.note = updates.note;
    if (updates.dueDate !== undefined) updateData.dueDate = updates.dueDate.toISOString();
    if (updates.completed !== undefined) updateData.completed = updates.completed;

    const params = new URLSearchParams({
      action: 'updateTask',
      data: JSON.stringify(updateData)
    });
    
    await fetchWithJsonp(`${WEB_APP_URL}?${params.toString()}`);
    console.log('Task updated successfully via Google Apps Script');
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete task
export const deleteTaskRecord = async (taskId: string): Promise<void> => {
  if (!isGoogleAppsScriptConfigured()) {
    throw new Error('Google Apps Script Web App URL ยังไม่ได้ตั้งค่า');
  }

  try {
    const params = new URLSearchParams({
      action: 'deleteTask',
      taskId: taskId
    });
    
    await fetchWithJsonp(`${WEB_APP_URL}?${params.toString()}`);
    console.log('Task deleted successfully via Google Apps Script');
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};