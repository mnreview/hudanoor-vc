import { TaskReminder } from '@/types';

// Import Vercel Tasks API
import * as VercelTasksAPI from './vercel-tasks';

// Always use Vercel API now
const shouldUseVercelAPI = () => {
  return true;
};

// Tasks API now uses Vercel backend

// Test connection to Vercel API
export const testConnection = async (): Promise<boolean> => {
  try {
    return await VercelTasksAPI.testConnection();
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Read tasks data via Vercel API
export const getTasksData = async (): Promise<TaskReminder[]> => {
  try {
    console.log('Using Vercel API for tasks data');
    return await VercelTasksAPI.getTasksData();
  } catch (error) {
    console.error('Error fetching tasks data:', error);
    throw error;
  }
};

// Add new task record via Vercel API
export const addTaskRecord = async (task: Omit<TaskReminder, 'id' | 'createdAt'>): Promise<void> => {
  try {
    console.log('Using Vercel API to add task');
    return await VercelTasksAPI.addTaskRecord(task);
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

// Update task via Vercel API
export const updateTaskRecord = async (taskId: string, updates: Partial<TaskReminder>): Promise<void> => {
  try {
    console.log('Using Vercel API to update task');
    return await VercelTasksAPI.updateTaskRecord(taskId, updates);
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

// Delete task via Vercel API
export const deleteTaskRecord = async (taskId: string): Promise<void> => {
  try {
    console.log('Using Vercel API to delete task');
    return await VercelTasksAPI.deleteTaskRecord(taskId);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};