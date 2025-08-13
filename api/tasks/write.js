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
    const { task } = req.body;

    if (!task) {
      return res.status(400).json({ error: 'Task data is required' });
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

    // Generate task ID
    const taskId = `task_${Date.now()}`;
    const now = new Date().toISOString();

    const values = [
      taskId,
      task.title,
      task.type,
      task.amount,
      task.note || '',
      task.dueDate,
      task.completed ? 'เสร็จแล้ว' : 'รอดำเนินการ',
      now
    ];

    // Try to write to Tasks sheet, fallback to creating it or using existing sheet
    let response;
    let usedSheet = 'Tasks';

    try {
      response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Tasks!A:H',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        },
      });
    } catch (error) {
      if (error.message.includes('Unable to parse range')) {
        // Tasks sheet doesn't exist, try to create it
        try {
          await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            resource: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: 'Tasks'
                    }
                  }
                }
              ]
            }
          });

          // Add headers
          await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: 'Tasks!A1:H1',
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']]
            },
          });

          // Try writing again
          response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'Tasks!A:H',
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [values]
            },
          });
        } catch (createError) {
          // If can't create Tasks sheet, use รายรับ sheet as fallback
          console.log('Cannot create Tasks sheet, using รายรับ as fallback');
          
          // Add a prefix to identify this as task data
          const fallbackValues = [`TASK_${taskId}`, ...values.slice(1)];
          
          response = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: 'รายรับ!A:K',
            valueInputOption: 'USER_ENTERED',
            resource: {
              values: [fallbackValues]
            },
          });
          usedSheet = 'รายรับ (fallback)';
        }
      } else {
        throw error;
      }
    }

    res.status(200).json({ 
      success: true,
      taskId: taskId,
      updatedRows: response.data.updates.updatedRows,
      updatedRange: response.data.updates.updatedRange
    });
  } catch (error) {
    console.error('Tasks Write Error:', error);
    res.status(500).json({ 
      error: 'Failed to write task',
      details: error.message 
    });
  }
}