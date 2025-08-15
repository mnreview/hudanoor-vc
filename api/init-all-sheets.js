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

    const results = [];

    // Define all sheets and their headers
    const sheetsConfig = [
      {
        name: 'รายรับ',
        headers: ['ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'ชื่อสินค้า', 'หมวดหมู่สินค้า', 'จำนวน', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ']
      },
      {
        name: 'รายจ่าย',
        headers: ['ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'รายการค่าใช้จ่าย', 'หมวดหมู่ค่าใช้จ่าย', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ']
      },
      {
        name: 'Tasks',
        headers: ['ID', 'Title', 'Type', 'Amount', 'Note', 'DueDate', 'Completed', 'CreatedAt']
      },
      {
        name: 'Settings',
        headers: ['Key', 'Value', 'Description']
      },
      {
        name: 'Employees',
        headers: ['ID', 'Name', 'Position', 'Email', 'Phone', 'HireDate', 'Salary', 'Status', 'BranchCommissions']
      },
      {
        name: 'UpdateLogs',
        headers: ['ID', 'Version', 'Date', 'Title', 'Description', 'Type']
      }
    ];

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId
    });

    const existingSheets = spreadsheet.data.sheets.map(sheet => sheet.properties.title);

    // Create missing sheets
    const sheetsToCreate = sheetsConfig.filter(config => !existingSheets.includes(config.name));

    if (sheetsToCreate.length > 0) {
      const requests = sheetsToCreate.map(config => ({
        addSheet: {
          properties: {
            title: config.name
          }
        }
      }));

      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests }
      });

      results.push(`Created ${sheetsToCreate.length} new sheets: ${sheetsToCreate.map(s => s.name).join(', ')}`);
    }

    // Add headers to all sheets
    for (const config of sheetsConfig) {
      try {
        const range = `${config.name}!A1:${String.fromCharCode(64 + config.headers.length)}1`;
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: {
            values: [config.headers]
          },
        });
        results.push(`Updated headers for ${config.name}`);
      } catch (error) {
        results.push(`Failed to update headers for ${config.name}: ${error.message}`);
      }
    }

    res.status(200).json({ 
      success: true,
      message: 'All sheets initialized successfully',
      results
    });
  } catch (error) {
    console.error('Init All Sheets Error:', error);
    res.status(500).json({ 
      error: 'Failed to initialize sheets',
      details: error.message 
    });
  }
}