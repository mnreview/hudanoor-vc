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
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Spreadsheet ID not configured' });
    }

    // Try different sheet names until we find one that works
    const possibleSheets = ['Tasks', 'รายรับ', 'รายจ่าย', 'Sheet1'];
    let response;
    let usedSheet = null;

    for (const sheetName of possibleSheets) {
      try {
        if (sheetName === 'Tasks') {
          response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:H`,
          });
        } else {
          // For other sheets, just get a small range to test
          const testResponse = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A1:A1`,
          });
          
          // If we can read from this sheet, try to create Tasks sheet
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

            // Add headers to new Tasks sheet
            await sheets.spreadsheets.values.update({
              spreadsheetId,
              range: 'Tasks!A1:H1',
              valueInputOption: 'USER_ENTERED',
              resource: {
                values: [['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']]
              },
            });

            // Now read from Tasks sheet
            response = await sheets.spreadsheets.values.get({
              spreadsheetId,
              range: 'Tasks!A:H',
            });
            usedSheet = 'Tasks';
            break;
          } catch (createError) {
            console.log('Could not create Tasks sheet:', createError.message);
            // Continue to next sheet
          }
        }
        usedSheet = sheetName;
        break;
      } catch (error) {
        console.log(`Sheet ${sheetName} not accessible:`, error.message);
        continue;
      }
    }

    if (!response) {
      // Return empty data with headers
      return res.status(200).json({ 
        data: [['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']],
        range: 'Tasks!A1:H1',
        majorDimension: 'ROWS',
        message: 'No accessible sheets found, returning empty data'
      });
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