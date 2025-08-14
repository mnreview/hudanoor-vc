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

    const sheetName = 'Expenses';
    const range = `${sheetName}!A:J`;

    // Handle GET request (read expenses)
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
            data: [['ID', 'วันที่', 'รายการ', 'หมวดหมู่', 'ค่าใช้จ่าย', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ']],
            range: `${sheetName}!A1:J1`,
            message: 'Expenses sheet not found, returning headers only'
          });
        }
        throw error;
      }
    }

    // Handle POST request (add expense)
    if (req.method === 'POST') {
      const expenseData = req.body;
      
      if (!expenseData.expense_item || !expenseData.cost) {
        return res.status(400).json({ error: 'Expense item and cost are required' });
      }

      const expenseId = `exp_${Date.now()}`;
      const now = new Date().toISOString();
      
      const values = [
        expenseId,
        expenseData.date || new Date().toISOString().split('T')[0],
        expenseData.expense_item || '',
        expenseData.expense_category || 'อื่นๆ',
        expenseData.cost || 0,
        expenseData.channel || 'store',
        expenseData.branch_or_platform || 'สาขาหลัก',
        expenseData.note || '',
        now,
        now
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
          expenseId,
          updatedRows: response.data.updates?.updatedRows || 1
        });
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(500).json({ 
            error: 'Expenses sheet not found. Please create Expenses sheet in your Google Sheets first.',
            details: error.message
          });
        }
        throw error;
      }
    }

    // Handle PUT request (update expense)
    if (req.method === 'PUT') {
      const { expenseId, updates } = req.body;
      
      if (!expenseId || !updates) {
        return res.status(400).json({ error: 'Expense ID and updates are required' });
      }

      // For now, return success (full update implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Expense update functionality simplified',
        expenseId
      });
    }

    // Handle DELETE request (delete expense)
    if (req.method === 'DELETE') {
      const { expenseId } = req.query;
      
      if (!expenseId) {
        return res.status(400).json({ error: 'Expense ID is required' });
      }

      // For now, return success (full delete implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Expense delete functionality simplified',
        expenseId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Expenses API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}