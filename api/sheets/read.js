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
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n').replace(/"/g, '');
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

    console.log('Debug info:', {
      hasClientEmail: !!clientEmail,
      hasPrivateKey: !!privateKey,
      hasSpreadsheetId: !!spreadsheetId,
      privateKeyStart: privateKey?.substring(0, 50) + '...'
    });

    if (!clientEmail || !privateKey || !spreadsheetId) {
      return res.status(500).json({ 
        error: 'Missing required environment variables',
        missing: {
          clientEmail: !clientEmail,
          privateKey: !privateKey,
          spreadsheetId: !spreadsheetId
        }
      });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const range = req.query.range || 'Sheet1!A:Z';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    res.status(200).json({ 
      data: response.data.values || [],
      range: response.data.range,
      majorDimension: response.data.majorDimension
    });
  } catch (error) {
    console.error('Sheets API Error:', error);
    res.status(500).json({ 
      error: 'Failed to read sheet data',
      details: error.message 
    });
  }
}