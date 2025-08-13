import { UpdateLog } from '@/types/settings';

// API base URL - automatically detects environment
const API_BASE = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api')
  : '/api';

// Helper function to convert sheet data to UpdateLog objects
const parseLogData = (rows: any[][]): UpdateLog[] => {
  if (!rows || rows.length <= 1) return [];
  
  // Skip header row
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `log_${index + 1}`,
    version: row[1] || '',
    date: row[2] || new Date().toISOString().split('T')[0],
    title: row[3] || '',
    description: row[4] || '',
    type: (row[5] || 'improvement') as UpdateLog['type'],
    isImportant: false, // Default value
    createdAt: row[2] || new Date().toISOString()
  }));
};

// Read logs data from Google Sheets via Vercel API
export const getLogsData = async (): Promise<UpdateLog[]> => {
  try {
    const response = await fetch(`${API_BASE}/logs`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return parseLogData(data.data || []);
  } catch (error) {
    console.error('Error fetching logs data:', error);
    throw error;
  }
};

// Add new log record via Vercel API
export const addLogRecord = async (log: Omit<UpdateLog, 'id' | 'createdAt'>): Promise<void> => {
  try {
    const logData = {
      version: log.version,
      date: log.date,
      title: log.title,
      description: log.description,
      type: log.type
    };

    const response = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ log: logData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Log added successfully via Vercel API');
  } catch (error) {
    console.error('Error adding log:', error);
    throw error;
  }
};

// Update log via Vercel API
export const updateLogRecord = async (logId: string, updates: Partial<UpdateLog>): Promise<void> => {
  try {
    const updateData: any = {};
    
    if (updates.version !== undefined) updateData.version = updates.version;
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;

    const response = await fetch(`${API_BASE}/logs`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ logId, updates: updateData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Log updated successfully via Vercel API');
  } catch (error) {
    console.error('Error updating log:', error);
    throw error;
  }
};

// Delete log via Vercel API
export const deleteLogRecord = async (logId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/logs?logId=${logId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Log deleted successfully via Vercel API');
  } catch (error) {
    console.error('Error deleting log:', error);
    throw error;
  }
};