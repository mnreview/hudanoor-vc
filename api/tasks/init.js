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

    // First, try to create the Tasks sheet
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
      console.log('Tasks sheet created successfully');
    } catch (error) {
      // Sheet might already exist, that's okay
      console.log('Tasks sheet might already exist:', error.message);
    }

    // Add headers to Tasks sheet
    const headers = [
      'ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt'
    ];

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Tasks!A1:H1',
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headers]
      },
    });

    res.status(200).json({ 
      success: true,
      message: 'Tasks sheet initialized successfully',
      updatedRange: response.data.updatedRange
    });
  } catch (error) {
    console.error('Tasks Init Error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize Tasks sheet',
      details: error.message 
    });
  }
}