import { createIncomeRecord } from '../src/lib/vercel-sheets.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const incomeData = req.body;
      
      // Validate required fields
      if (!incomeData.date || !incomeData.product_name || !incomeData.price) {
        return res.status(400).json({ 
          error: 'Missing required fields: date, product_name, price' 
        });
      }

      // Create income record
      const result = await createIncomeRecord(incomeData);
      
      return res.status(200).json({ 
        success: true, 
        message: 'Income record created successfully',
        data: result 
      });
    } catch (error) {
      console.error('Error creating income record:', error);
      return res.status(500).json({ 
        error: 'Failed to create income record',
        details: error.message 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}