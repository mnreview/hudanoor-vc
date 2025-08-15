import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Spreadsheet ID not configured' });
    }

    const sheetName = 'Employees';
    const range = `${sheetName}!A:J`; // Extended to include commission columns

    // Handle GET request (read employees)
    if (req.method === 'GET') {
      try {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });
        
        return res.status(200).json({ 
          data: response.data.values || [],
          range: response.data.range
        });
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(200).json({ 
            data: [['ID', 'Name', 'Position', 'Email', 'Phone', 'HireDate', 'Salary', 'Status', 'StoreCommission', 'OnlineCommission']],
            range: `${sheetName}!A1:J1`,
            message: 'Employees sheet not found, returning headers only'
          });
        }
        throw error;
      }
    }

    // Handle POST request (add employee)
    if (req.method === 'POST') {
      const { employee } = req.body;
      
      if (!employee) {
        return res.status(400).json({ error: 'Employee data is required' });
      }

      const employeeId = employee.id || `emp_${Date.now()}`;
      const values = [
        employeeId,
        employee.name || '',
        employee.position || '',
        employee.email || '',
        employee.phone || '',
        employee.hireDate || new Date().toISOString().split('T')[0],
        parseFloat(employee.salary) || 0, // Ensure salary is stored as number
        employee.status || 'active',
        parseFloat(employee.storeCommission) || 0, // Ensure commission is stored as number
        parseFloat(employee.onlineCommission) || 0 // Ensure commission is stored as number
      ];

      try {
        const response = await sheets.spreadsheets.values.append({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [values] },
        });

        return res.status(200).json({ 
          success: true,
          employeeId,
          updatedRows: response.data.updates?.updatedRows || 1
        });
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(500).json({ 
            error: 'Employees sheet not found. Please create Employees sheet in your Google Sheets first.',
            details: error.message
          });
        }
        throw error;
      }
    }

    // Handle PUT request (update employee)
    if (req.method === 'PUT') {
      const { employeeId, updates } = req.body;
      
      if (!employeeId || !updates) {
        return res.status(400).json({ error: 'Employee ID and updates are required' });
      }

      try {
        // Get all data to find the row to update
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = response.data.values || [];
        const headerRow = rows[0] || [];
        const dataRows = rows.slice(1);
        
        // Find the employee row
        const employeeRowIndex = dataRows.findIndex(row => row[0] === employeeId);
        
        if (employeeRowIndex === -1) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        // Update the row data
        const currentRow = dataRows[employeeRowIndex];
        const updatedRow = [...currentRow];
        
        // Map updates to column positions with proper type conversion
        if (updates.name !== undefined) updatedRow[1] = updates.name;
        if (updates.position !== undefined) updatedRow[2] = updates.position;
        if (updates.email !== undefined) updatedRow[3] = updates.email;
        if (updates.phone !== undefined) updatedRow[4] = updates.phone;
        if (updates.salary !== undefined) updatedRow[6] = parseFloat(updates.salary) || 0;
        if (updates.status !== undefined) updatedRow[7] = updates.status;
        if (updates.storeCommission !== undefined) updatedRow[8] = parseFloat(updates.storeCommission) || 0;
        if (updates.onlineCommission !== undefined) updatedRow[9] = parseFloat(updates.onlineCommission) || 0;

        // Update the specific row
        const updateRange = `${sheetName}!A${employeeRowIndex + 2}:J${employeeRowIndex + 2}`;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [updatedRow] },
        });

        return res.status(200).json({ 
          success: true,
          employeeId,
          message: 'Employee updated successfully'
        });
      } catch (error) {
        console.error('Update error:', error);
        return res.status(500).json({ 
          error: 'Failed to update employee',
          details: error.message 
        });
      }
    }

    // Handle DELETE request (delete employee)
    if (req.method === 'DELETE') {
      const { employeeId } = req.query;
      
      if (!employeeId) {
        return res.status(400).json({ error: 'Employee ID is required' });
      }

      try {
        // Get all data to find the row to delete
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = response.data.values || [];
        const dataRows = rows.slice(1);
        
        // Find the employee row
        const employeeRowIndex = dataRows.findIndex(row => row[0] === employeeId);
        
        if (employeeRowIndex === -1) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        // Delete the row (Google Sheets API doesn't have direct row deletion, so we'll clear it)
        const deleteRange = `${sheetName}!A${employeeRowIndex + 2}:J${employeeRowIndex + 2}`;
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: deleteRange,
        });

        return res.status(200).json({ 
          success: true,
          employeeId,
          message: 'Employee deleted successfully'
        });
      } catch (error) {
        console.error('Delete error:', error);
        return res.status(500).json({ 
          error: 'Failed to delete employee',
          details: error.message 
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Employees API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}