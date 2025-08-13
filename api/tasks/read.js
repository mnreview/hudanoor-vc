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

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, ''),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Spreadsheet ID not configured' });
    }

    // Try Tasks sheet first, fallback to creating a new sheet or using existing sheet
    let response;
    try {
      response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Tasks!A:H',
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

          // Try reading again
          response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'Tasks!A:H',
          });
        } catch (createError) {
          // Return empty data if can't create sheet
          return res.status(200).json({ 
            data: [['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']],
            range: 'Tasks!A1:H1',
            majorDimension: 'ROWS'
          });
        }
      } else {
        throw error;
      }
    }

    res.status(200).json({ 
      data: response.data.values || [],
      range: response.data.range,
      majorDimension: response.data.majorDimension
    });
  } catch (error) {
    console.error('Tasks API Error:', error);
    res.status(500).json({ 
      error: 'Failed to read tasks data',
      details: error.message 
    });
  }
}