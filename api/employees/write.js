import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { employee } = req.body;

    if (!employee) {
      return res.status(400).json({ error: 'Employee data is required' });
    }

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

    // Generate employee ID
    const employeeId = employee.id || `emp_${Date.now()}`;

    const values = [
      employeeId,
      employee.name,
      employee.position,
      employee.email || '',
      employee.phone || '',
      employee.hireDate || new Date().toISOString(),
      employee.salary || 0,
      employee.status || 'active'
    ];

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Employees!A:H',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [values]
      },
    });

    res.status(200).json({ 
      success: true,
      employeeId: employeeId,
      updatedRows: response.data.updates.updatedRows,
      updatedRange: response.data.updates.updatedRange
    });
  } catch (error) {
    console.error('Employees Write Error:', error);
    res.status(500).json({ 
      error: 'Failed to write employee',
      details: error.message 
    });
  }
}