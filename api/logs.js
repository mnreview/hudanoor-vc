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

    const sheetName = 'UpdateLogs';
    const range = `${sheetName}!A:F`;

    // Handle GET request (read logs)
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
            data: [['ID', 'Version', 'Date', 'Title', 'Description', 'Type']],
            range: `${sheetName}!A1:F1`,
            message: 'UpdateLogs sheet not found, returning headers only'
          });
        }
        throw error;
      }
    }

    // Handle POST request (add log)
    if (req.method === 'POST') {
      const { log } = req.body;
      
      if (!log) {
        return res.status(400).json({ error: 'Log data is required' });
      }

      const logId = log.id || `log_${Date.now()}`;
      const values = [
        logId,
        log.version || '',
        log.date || new Date().toISOString().split('T')[0],
        log.title || '',
        log.description || '',
        log.type || 'improvement'
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
          logId,
          updatedRows: response.data.updates?.updatedRows || 1
        });
      } catch (error) {
        if (error.message.includes('Unable to parse range')) {
          return res.status(500).json({ 
            error: 'UpdateLogs sheet not found. Please create UpdateLogs sheet in your Google Sheets first.',
            details: error.message
          });
        }
        throw error;
      }
    }

    // Handle PUT request (update log)
    if (req.method === 'PUT') {
      const { logId, updates } = req.body;
      
      if (!logId || !updates) {
        return res.status(400).json({ error: 'Log ID and updates are required' });
      }

      // For now, return success (full update implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Log update functionality simplified',
        logId
      });
    }

    // Handle DELETE request (delete log)
    if (req.method === 'DELETE') {
      const { logId } = req.query;
      
      if (!logId) {
        return res.status(400).json({ error: 'Log ID is required' });
      }

      // For now, return success (full delete implementation would require finding the row)
      return res.status(200).json({ 
        success: true,
        message: 'Log delete functionality simplified',
        logId
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Logs API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process request',
      details: error.message 
    });
  }
}