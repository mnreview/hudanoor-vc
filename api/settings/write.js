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
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Key and value are required' });
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

    // First, check if setting already exists
    const readResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Settings!A:C',
    });

    const rows = readResponse.data.values || [];
    const existingRowIndex = rows.findIndex(row => row[0] === key);

    const values = [key, JSON.stringify(value), description || ''];

    if (existingRowIndex !== -1) {
      // Update existing setting
      const response = await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Settings!A${existingRowIndex + 1}:C${existingRowIndex + 1}`,
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        },
      });

      res.status(200).json({ 
        success: true,
        action: 'updated',
        updatedRange: response.data.updatedRange
      });
    } else {
      // Add new setting
      const response = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Settings!A:C',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [values]
        },
      });

      res.status(200).json({ 
        success: true,
        action: 'created',
        updatedRows: response.data.updates.updatedRows,
        updatedRange: response.data.updates.updatedRange
      });
    }
  } catch (error) {
    console.error('Settings Write Error:', error);
    res.status(500).json({ 
      error: 'Failed to write setting',
      details: error.message 
    });
  }
}