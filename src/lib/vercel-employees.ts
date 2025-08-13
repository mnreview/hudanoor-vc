import { Employee } from '@/types/employee';

// API base URL - automatically detects environment
const API_BASE = typeof window !== 'undefined' 
  ? (window.location.hostname === 'localhost' ? 'http://localhost:3000/api' : '/api')
  : '/api';

// Helper function to convert sheet data to Employee objects
const parseEmployeeData = (rows: any[][]): Employee[] => {
  if (!rows || rows.length <= 1) return [];
  
  // Skip header row
  return rows.slice(1).map((row, index) => ({
    id: row[0] || `emp_${index + 1}`,
    name: row[1] || '',
    position: row[2] || '',
    email: row[3] || '',
    phone: row[4] || '',
    startDate: row[5] || new Date().toISOString().split('T')[0],
    salary: parseFloat(row[6]) || 0,
    isActive: row[7] === 'active',
    storeCommission: 2.5, // Default values
    onlineCommission: 3.0,
    createdAt: row[5] || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
};

// Read employees data from Google Sheets via Vercel API
export const getEmployeesData = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}/employees`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return parseEmployeeData(data.data || []);
  } catch (error) {
    console.error('Error fetching employees data:', error);
    throw error;
  }
};

// Add new employee record via Vercel API
export const addEmployeeRecord = async (employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> => {
  try {
    const employeeData = {
      name: employee.name,
      position: employee.position,
      email: employee.email || '',
      phone: employee.phone || '',
      hireDate: employee.startDate,
      salary: employee.salary,
      status: employee.isActive ? 'active' : 'inactive'
    };

    const response = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employee: employeeData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Employee added successfully via Vercel API');
  } catch (error) {
    console.error('Error adding employee:', error);
    throw error;
  }
};

// Update employee via Vercel API
export const updateEmployeeRecord = async (employeeId: string, updates: Partial<Employee>): Promise<void> => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.salary !== undefined) updateData.salary = updates.salary;
    if (updates.isActive !== undefined) updateData.status = updates.isActive ? 'active' : 'inactive';

    const response = await fetch(`${API_BASE}/employees`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId, updates: updateData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Employee updated successfully via Vercel API');
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

// Delete employee via Vercel API
export const deleteEmployeeRecord = async (employeeId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/employees?employeeId=${employeeId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    console.log('Employee deleted successfully via Vercel API');
  } catch (error) {
    console.error('Error deleting employee:', error);
    throw error;
  }
};

// Test connection to Vercel API
export const testConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};