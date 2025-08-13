import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { taskId } = req.method === 'DELETE' ? req.query : req.body;

    if (!taskId) {
      return res.status(400).json({ error: 'Task ID is required' });
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

    // First, find the task row
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Tasks!A:H',
    });

    const rows = readResponse.data.values || [];
    const taskRowIndex = rows.findIndex(row => row[0] === taskId);

    if (taskRowIndex === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Delete the row by clearing it and then removing
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0, // Assuming Tasks is the first sheet
                dimension: 'ROWS',
                startIndex: taskRowIndex,
                endIndex: taskRowIndex + 1
              }
            }
          }
        ]
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Tasks Delete Error:', error);
    res.status(500).json({ 
      error: 'Failed to delete task',
      details: error.message 
    });
  }
}