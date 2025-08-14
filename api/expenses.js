// For Vercel deployment, we need to use the sheets API directly
import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const expenseData = req.body;
      
      // Validate required fields
      if (!expenseData.expense_item || !expenseData.cost) {
        return res.status(400).json({ 
          error: 'Missing required fields: expense_item, cost' 
        });
      }

      // Set up Google Sheets API
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

      // Create expense record
      const id = `expense_${Date.now()}`;
      const now = new Date().toISOString();
      
      const values = [
        id,
        expenseData.date || new Date().toISOString().split('T')[0],
        expenseData.channel || 'store',
        expenseData.branch_or_platform || '',
        expenseData.expense_item,
        expenseData.expense_category || '',
        expenseData.cost,
        expenseData.note || '',
        now,
        now
      ];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'รายจ่าย!A:J',
        valueInputOption: 'USER_ENTERED',
        resource: { values: [values] },
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Expense record created successfully',
        data: { id, updatedRows: response.data.updates?.updatedRows || 1 }
      });
    } catch (error) {
      console.error('Error creating expense record:', error);
      return res.status(500).json({ 
        error: 'Failed to create expense record',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}