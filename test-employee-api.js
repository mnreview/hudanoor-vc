// Test script for Employee API functionality
const API_BASE = 'http://localhost:3000/api';

async function testEmployeeAPI() {
  console.log('🧪 Testing Employee API...\n');

  try {
    // Test 1: Initialize sheets
    console.log('1. Initializing sheets...');
    const initResponse = await fetch(`${API_BASE}/init-all-sheets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const initResult = await initResponse.json();
    console.log('✅ Init result:', initResult);

    // Test 2: Get employees (should be empty initially)
    console.log('\n2. Getting employees...');
    const getResponse = await fetch(`${API_BASE}/employees`);
    const getResult = await getResponse.json();
    console.log('✅ Get employees result:', getResult);

    // Test 3: Add a test employee
    console.log('\n3. Adding test employee...');
    const testEmployee = {
      name: 'ทดสอบ พนักงาน',
      position: 'พนักงานขาย',
      email: 'test@example.com',
      phone: '081-234-5678',
      hireDate: '2024-01-15',
      salary: 15000,
      status: 'active',
      storeCommission: 2.5,
      onlineCommission: 3.0
    };

    const addResponse = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employee: testEmployee })
    });
    const addResult = await addResponse.json();
    console.log('✅ Add employee result:', addResult);

    if (addResult.success) {
      const employeeId = addResult.employeeId;

      // Test 4: Get employees again (should have 1 employee)
      console.log('\n4. Getting employees after adding...');
      const getResponse2 = await fetch(`${API_BASE}/employees`);
      const getResult2 = await getResponse2.json();
      console.log('✅ Get employees after add:', getResult2);

      // Test 5: Update employee
      console.log('\n5. Updating employee...');
      const updateData = {
        name: 'ทดสอบ พนักงาน (แก้ไข)',
        salary: 18000,
        storeCommission: 3.0,
        onlineCommission: 3.5
      };

      const updateResponse = await fetch(`${API_BASE}/employees`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId, updates: updateData })
      });
      const updateResult = await updateResponse.json();
      console.log('✅ Update employee result:', updateResult);

      // Test 6: Get employees after update
      console.log('\n6. Getting employees after update...');
      const getResponse3 = await fetch(`${API_BASE}/employees`);
      const getResult3 = await getResponse3.json();
      console.log('✅ Get employees after update:', getResult3);

      // Test 7: Delete employee
      console.log('\n7. Deleting employee...');
      const deleteResponse = await fetch(`${API_BASE}/employees?employeeId=${employeeId}`, {
        method: 'DELETE'
      });
      const deleteResult = await deleteResponse.json();
      console.log('✅ Delete employee result:', deleteResult);

      // Test 8: Get employees after delete
      console.log('\n8. Getting employees after delete...');
      const getResponse4 = await fetch(`${API_BASE}/employees`);
      const getResult4 = await getResponse4.json();
      console.log('✅ Get employees after delete:', getResult4);
    }

    console.log('\n🎉 All employee API tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testEmployeeAPI();