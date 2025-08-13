// Test script for Vercel API endpoints
// Run with: node test-vercel-api.js

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';

async function testHealthEndpoint() {
  console.log('🔍 Testing Health Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    console.log('✅ Health check:', data);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
  }
}

async function testReadEndpoint() {
  console.log('\n🔍 Testing Read Endpoint...');
  try {
    const response = await fetch(`${API_BASE}/sheets/read?range=รายรับ!A:K`);
    const data = await response.json();
    console.log('✅ Read test:', {
      status: response.status,
      dataLength: data.data?.length || 0,
      range: data.range
    });
  } catch (error) {
    console.error('❌ Read test failed:', error.message);
  }
}

async function testWriteEndpoint() {
  console.log('\n🔍 Testing Write Endpoint...');
  try {
    const testData = {
      range: 'รายรับ!A:K',
      values: [
        [
          `test_${Date.now()}`,
          new Date().toISOString(),
          'online',
          'test_platform',
          'test_product',
          'test_category',
          1,
          100,
          'API test',
          new Date().toISOString(),
          new Date().toISOString()
        ]
      ]
    };

    const response = await fetch(`${API_BASE}/sheets/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const data = await response.json();
    console.log('✅ Write test:', {
      status: response.status,
      success: data.success,
      updatedRows: data.updatedRows
    });
  } catch (error) {
    console.error('❌ Write test failed:', error.message);
  }
}

async function runTests() {
  console.log(`🚀 Testing Vercel API at: ${API_BASE}\n`);
  
  await testHealthEndpoint();
  await testReadEndpoint();
  await testWriteEndpoint();
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testHealthEndpoint, testReadEndpoint, testWriteEndpoint };