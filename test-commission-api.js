// Test script for commission reports API
const API_BASE = 'http://localhost:3000/api';

async function testCommissionReports() {
  console.log('🧪 Testing Commission Reports API...\n');

  try {
    // Test 1: Get current month commission reports
    console.log('📊 Test 1: Get current month commission reports');
    const response1 = await fetch(`${API_BASE}/commission-reports`);
    
    if (response1.ok) {
      const data1 = await response1.json();
      console.log('✅ Success!');
      console.log(`📈 Period: ${data1.period}`);
      console.log(`👥 Total Employees: ${data1.totalEmployees}`);
      console.log(`💰 Total Commissions: ${data1.totalCommissions.toLocaleString()} บาท`);
      console.log(`📋 Reports Count: ${data1.data.length}`);
      
      if (data1.data.length > 0) {
        console.log('\n📝 Sample Report:');
        const sample = data1.data[0];
        console.log(`   Employee: ${sample.employeeName}`);
        console.log(`   Store Sales: ${sample.storeSales.toLocaleString()} บาท`);
        console.log(`   Online Sales: ${sample.onlineSales.toLocaleString()} บาท`);
        console.log(`   Store Commission: ${sample.storeCommission.toLocaleString()} บาท`);
        console.log(`   Online Commission: ${sample.onlineCommission.toLocaleString()} บาท`);
        console.log(`   Total Commission: ${sample.totalCommission.toLocaleString()} บาท`);
        console.log(`   Total Earnings: ${sample.totalEarnings.toLocaleString()} บาท`);
      }
    } else {
      const error1 = await response1.json();
      console.log('❌ Failed:', error1.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Get specific month commission reports
    console.log('📊 Test 2: Get specific month commission reports (2024-12)');
    const response2 = await fetch(`${API_BASE}/commission-reports?period=2024-12`);
    
    if (response2.ok) {
      const data2 = await response2.json();
      console.log('✅ Success!');
      console.log(`📈 Period: ${data2.period}`);
      console.log(`👥 Total Employees: ${data2.totalEmployees}`);
      console.log(`💰 Total Commissions: ${data2.totalCommissions.toLocaleString()} บาท`);
      console.log(`📋 Reports Count: ${data2.data.length}`);
    } else {
      const error2 = await response2.json();
      console.log('❌ Failed:', error2.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Test with employees API to verify data consistency
    console.log('👥 Test 3: Verify employees data consistency');
    const employeesResponse = await fetch(`${API_BASE}/employees`);
    
    if (employeesResponse.ok) {
      const employeesData = await employeesResponse.json();
      console.log('✅ Employees API working!');
      console.log(`📋 Total Employees in Sheet: ${employeesData.data.length - 1}`); // -1 for header
      
      if (employeesData.data.length > 1) {
        console.log('\n📝 Sample Employee Data:');
        const sampleEmployee = employeesData.data[1]; // First data row (skip header)
        console.log(`   ID: ${sampleEmployee[0]}`);
        console.log(`   Name: ${sampleEmployee[1]}`);
        console.log(`   Position: ${sampleEmployee[2]}`);
        console.log(`   Salary: ${sampleEmployee[6]}`);
        console.log(`   Status: ${sampleEmployee[7]}`);
        console.log(`   Branch Commissions: ${sampleEmployee[8]}`);
      }
    } else {
      const employeesError = await employeesResponse.json();
      console.log('❌ Employees API Failed:', employeesError.error);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 4: Test income data
    console.log('💰 Test 4: Check income data availability');
    try {
      // We can't directly test income API as it's POST only, but we can check if it exists
      const incomeTestResponse = await fetch(`${API_BASE}/income`, {
        method: 'OPTIONS'
      });
      
      if (incomeTestResponse.ok) {
        console.log('✅ Income API endpoint exists and accessible');
      } else {
        console.log('⚠️  Income API endpoint may not be accessible');
      }
    } catch (error) {
      console.log('⚠️  Could not test income API:', error.message);
    }

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  }
}

// Run the test
testCommissionReports();