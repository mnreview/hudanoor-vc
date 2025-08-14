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

    // Handle PUT request (update task)
    if (req.method === 'PUT') {
      const { taskId, updates } = req.body;
      
      if (!taskId || !updates) {
        return res.status(400).json({ error: 'Task ID and updates are required' });
      }

      try {
        // First, get all tasks to find the row
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
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
          range: `${sheetName}!A${taskRowIndex + 1}:H${taskRowIndex + 1}`,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [updatedRow]
          },
        });

        return res.status(200).json({ 
          success: true,
          updatedCells: updateResponse.data.updatedCells,
          updatedRows: updateResponse.data.updatedRows,
          updatedRange: updateResponse.data.updatedRange
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

    // Handle DELETE request (delete task)
    if (req.method === 'DELETE') {
      const { taskId } = req.query;
      
      if (!taskId) {
        return res.status(400).json({ error: 'Task ID is required' });
      }

      try {
        // First, get all tasks to find the row
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const rows = readResponse.data.values || [];
        const taskRowIndex = rows.findIndex(row => row[0] === taskId);

        if (taskRowIndex === -1) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Get sheet ID for the Tasks sheet
        const spreadsheet = await sheets.spreadsheets.get({
          spreadsheetId
        });

        const tasksSheet = spreadsheet.data.sheets?.find(sheet => 
          sheet.properties?.title === sheetName
        );

        if (!tasksSheet) {
          return res.status(500).json({ error: 'Tasks sheet not found' });
        }

        const sheetId = tasksSheet.properties?.sheetId;

        // Delete the row
        await sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: taskRowIndex,
                    endIndex: taskRowIndex + 1
                  }
                }
              }
            ]
          }
        });

        return res.status(200).json({ 
          success: true,
          message: 'Task deleted successfully'
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