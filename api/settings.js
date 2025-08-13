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

    const sheetName = 'Settings';
    const range = `${sheetName}!A:C`;

    // Handle GET request (read settings)
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
            data: [['Key', 'Value', 'Description']],
            range: `${sheetName}!A1:C1`,
            message: 'Settings sheet not found, returning headers only'
          });
        }
        throw error;
      }
    }

    // Handle POST request (add/update setting)
    if (req.method === 'POST') {
      const { key, value, description } = req.body;
      
      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      const values = [key, JSON.stringify(value), description || ''];

      try {
        // First, try to find if the setting already exists
        const readResponse = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range,
        });

        const existingData = readResponse.data.values || [];
        const existingRowIndex = existingData.findIndex(row => row[0] === key);

        if (existingRowIndex > 0) { // > 0 because index 0 is headers
          // Update existing setting
          const updateResponse = await sheets.spreadsheets.values.update({
            spreadsheetId,
            range: `${sheetName}!A${existingRowIndex + 1}:C${existingRowIndex + 1}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] },
          });

          return res.status(200).json({ 
            success: true,
            action: 'updated',
            key,
            updatedCells: updateResponse.data.updatedCells
          });
        } else {
          // Add new setting
          const appendResponse = await sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [values] },
          });

          return res.status(200).json({ 
            success: true,
            action: 'created',
            key,
            updatedRows: appendResponse.data.updates?.updatedRows || 1
          });
        }
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(500).json({ 
            error: 'Settings sheet not found. Please create Settings sheet in your Google Sheets first.',
            details: error.message
          });
        }
        throw error;
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Settings API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}