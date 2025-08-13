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

    const sheetName = 'Tasks';
    const range = `${sheetName}!A:H`;

    // Handle GET request (read tasks)
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
            data: [['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']],
            range: `${sheetName}!A1:H1`,
            message: 'Tasks sheet not found, returning headers only'
          });
        }
        throw error;
      }
    }

    // Handle POST request (add task)
    if (req.method === 'POST') {
      const { task } = req.body;
      
      if (!task) {
        return res.status(400).json({ error: 'Task data is required' });
      }

      const taskId = `task_${Date.now()}`;
      const values = [
        taskId,
        task.title || '',
        task.type || 'expense',
        task.amount || 0,
        task.note || '',
        task.dueDate || new Date().toISOString(),
        task.completed ? 'เสร็จแล้ว' : 'รอดำเนินการ',
        new Date().toISOString()
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
          taskId,
          updatedRows: response.data.updates?.updatedRows || 1
        });
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(500).json({ 
            error: 'Tasks sheet not found. Please create Tasks sheet in your Google Sheets first.',
            details: error.message
          });
        }
        throw error;
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Tasks API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}