// Script to add update log entry for the task API fix
const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function addUpdateLog() {
  const logData = {
    version: "1.0.1",
    date: new Date().toISOString().split('T')[0],
    title: "แก้ไข API endpoint สำหรับการอัพเดท Task",
    description: "แก้ไขปัญหา API endpoint ที่ไม่ถูกต้องในการอัพเดท Task จาก '/data?type=tasks&action=update' เป็น '/tasks' ตามมาตรฐาน REST API",
    type: "bugfix"
  };

  try {
    const response = await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ log: logData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Update log added successfully:', result);
  } catch (error) {
    console.error('❌ Failed to add update log:', error.message);
  }
}

// Run if this file is executed directly
if (require.main === module) {
  addUpdateLog().catch(console.error);
}

module.exports = { addUpdateLog };