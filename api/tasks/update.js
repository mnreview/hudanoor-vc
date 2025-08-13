import { google } from 'googleapis';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { taskId, updates } = req.body;

    if (!taskId || !updates) {
      return res.status(400).json({ error: 'Task ID and updates are required' });
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

    // Update the row
    const currentRow = rows[taskRowIndex];
    const updatedRow = [
      taskId, // ID (A)
      updates.title !== undefined ? updates.title : currentRow[1], // Title (B)
      updates.type !== undefined ? updates.type : currentRow[2], // Type (C)
      updates.amount !== undefined ? updates.amount : currentRow[3], // Amount (D)
      updates.note !== undefined ? updates.note : currentRow[4], // Note (E)
      updates.dueDate !== undefined ? updates.dueDate : currentRow[5], // DueDate (F)
      updates.completed !== undefined ? (updates.completed ? 'เสร็จแล้ว' : 'รอดำเนินการ') : currentRow[6], // Completed (G)
      currentRow[7] // CreatedAt (H) - keep original
    ];

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Tasks!A${taskRowIndex + 1}:H${taskRowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [updatedRow]
      },
    });

    res.status(200).json({ 
      success: true,
      updatedCells: updateResponse.data.updatedCells,
      updatedRows: updateResponse.data.updatedRows,
      updatedRange: updateResponse.data.updatedRange
    });
  } catch (error) {
    console.error('Tasks Update Error:', error);
    res.status(500).json({ 
      error: 'Failed to update task',
      details: error.message 
    });
  }
}