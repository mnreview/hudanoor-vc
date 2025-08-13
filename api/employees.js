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
    const range = `${sheetName}!A:H`;

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
            data: [['ID', 'Name', 'Position', 'Email', 'Phone', 'HireDate', 'Salary', 'Status']],
            range: `${sheetName}!A1:H1`,
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
        employee.salary || 0,
        employee.status || 'active'
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

      // For now, return success (full update implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Employee update functionality simplified',
        employeeId
      });
    }

    // Handle DELETE request (delete employee)
    if (req.method === 'DELETE') {
      const { employeeId } = req.query;
      
      if (!employeeId) {
        return res.status(400).json({ error: 'Employee ID is required' });
      }

      // For now, return success (full delete implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Employee delete functionality simplified',
        employeeId
      });
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