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
    const { range, values } = req.body;

    if (!range || !values) {
      return res.status(400).json({ error: 'Range and values are required' });
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || process.env.GOOGLE_SHEETS_ID;

    if (!spreadsheetId) {
      return res.status(500).json({ error: 'Spreadsheet ID not configured' });
    }

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: Array.isArray(values[0]) ? values : [values]
      },
    });

    res.status(200).json({ 
      success: true,
      updatedCells: response.data.updatedCells,
      updatedRows: response.data.updatedRows,
      updatedColumns: response.data.updatedColumns,
      updatedRange: response.data.updatedRange
    });
  } catch (error) {
    console.error('Sheets Update Error:', error);
    res.status(500).json({ 
      error: 'Failed to update sheet',
      details: error.message 
    });
  }
}