import fs from 'fs';
import path from 'path';

const LOGS_FILE_PATH = path.join(process.cwd(), 'src/data/update-logs.json');

// Ensure the data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(LOGS_FILE_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read logs from JSON file
function readLogs() {
  try {
    ensureDataDirectory();
    if (!fs.existsSync(LOGS_FILE_PATH)) {
      return [];
    }
    const data = fs.readFileSync(LOGS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading logs:', error);
    return [];
  }
}

// Write logs to JSON file
function writeLogs(logs) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing logs:', error);
    return false;
  }
}

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
    // Handle GET request (read logs)
    if (req.method === 'GET') {
      const logs = readLogs();
      
      // Sort by date and time (newest first)
      const sortedLogs = logs.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time || '00:00:00'}`);
        const dateB = new Date(`${b.date} ${b.time || '00:00:00'}`);
        return dateB - dateA;
      });

      return res.status(200).json({ 
        data: sortedLogs,
        total: sortedLogs.length,
        source: 'local_json'
      });
    }

    // Handle POST request (add log)
    if (req.method === 'POST') {
      const { log } = req.body;
      
      if (!log) {
        return res.status(400).json({ error: 'Log data is required' });
      }

      const logs = readLogs();
      
      const newLog = {
        id: log.id || `log_${Date.now()}`,
        version: log.version || '',
        type: log.type || 'improvement',
        title: log.title || '',
        description: log.description || '',
        changes: log.changes || [],
        technical_details: log.technical_details || '',
        impact: log.impact || '',
        date: log.date || new Date().toISOString().split('T')[0],
        time: log.time || new Date().toLocaleTimeString('th-TH', { hour12: false })
      };

      // Add to beginning of array (newest first)
      logs.unshift(newLog);

      const success = writeLogs(logs);
      
      if (success) {
        return res.status(200).json({ 
          success: true,
          logId: newLog.id,
          message: 'Log added successfully'
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to save log'
        });
      }
    }

    // Handle PUT request (update log)
    if (req.method === 'PUT') {
      const { logId, updates } = req.body;
      
      if (!logId || !updates) {
        return res.status(400).json({ error: 'Log ID and updates are required' });
      }

      const logs = readLogs();
      const logIndex = logs.findIndex(log => log.id === logId);
      
      if (logIndex === -1) {
        return res.status(404).json({ error: 'Log not found' });
      }

      // Update the log
      logs[logIndex] = { ...logs[logIndex], ...updates };
      
      const success = writeLogs(logs);
      
      if (success) {
        return res.status(200).json({ 
          success: true,
          logId,
          message: 'Log updated successfully'
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to update log'
        });
      }
    }

    // Handle DELETE request (delete log)
    if (req.method === 'DELETE') {
      const { logId } = req.query;
      
      if (!logId) {
        return res.status(400).json({ error: 'Log ID is required' });
      }

      const logs = readLogs();
      const filteredLogs = logs.filter(log => log.id !== logId);
      
      if (filteredLogs.length === logs.length) {
        return res.status(404).json({ error: 'Log not found' });
      }

      const success = writeLogs(filteredLogs);
      
      if (success) {
        return res.status(200).json({ 
          success: true,
          logId,
          message: 'Log deleted successfully'
        });
      } else {
        return res.status(500).json({ 
          error: 'Failed to delete log'
        });
      }
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