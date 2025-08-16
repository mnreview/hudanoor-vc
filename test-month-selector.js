// Test script for month selector functionality
const API_BASE = 'http://localhost:3000/api';

async function testMonthSelector() {
  console.log('📅 Testing Month Selector Functionality...\n');

  // Generate test months (same logic as in component)
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = date.toISOString().substring(0, 7); // YYYY-MM
      const label = date.toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'long' 
      });
      options.push({ value, label });
    }
    
    return options;
  };

  const monthOptions = generateMonthOptions();
  
  console.log('📋 Available Month Options:');
  monthOptions.forEach((option, index) => {
    console.log(`   ${index + 1}. ${option.label} (${option.value})`);
  });

  console.log('\n' + '='.repeat(50) + '\n');

  // Test commission reports for different months
  console.log('🧪 Testing Commission Reports for Different Months:\n');

  for (let i = 0; i < Math.min(3, monthOptions.length); i++) {
    const option = monthOptions[i];
    console.log(`📊 Testing ${option.label} (${option.value}):`);
    
    try {
      const response = await fetch(`${API_BASE}/commission-reports?period=${option.value}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`   ✅ Success!`);
        console.log(`   👥 Employees: ${data.totalEmployees}`);
        console.log(`   💰 Total Commissions: ${data.totalCommissions.toLocaleString()} บาท`);
        console.log(`   📋 Reports: ${data.data.length} records`);
        
        if (data.data.length > 0) {
          const totalSales = data.data.reduce((sum, report) => 
            sum + report.storeSales + report.onlineSales, 0
          );
          console.log(`   💵 Total Sales: ${totalSales.toLocaleString()} บาท`);
        }
      } else {
        const error = await response.json();
        console.log(`   ❌ Failed: ${error.error}`);
      }
    } catch (error) {
      console.log(`   💥 Error: ${error.message}`);
    }
    
    console.log('');
  }

  console.log('='.repeat(50) + '\n');

  // Test current month (default behavior)
  console.log('📅 Testing Current Month (Default):');
  try {
    const response = await fetch(`${API_BASE}/commission-reports`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Current Month Success!`);
      console.log(`📈 Period: ${data.period}`);
      console.log(`👥 Employees: ${data.totalEmployees}`);
      console.log(`💰 Total Commissions: ${data.totalCommissions.toLocaleString()} บาท`);
      
      // Check if current month matches expected format
      const currentMonth = new Date().toISOString().substring(0, 7);
      if (data.period === currentMonth) {
        console.log(`✅ Period matches current month: ${currentMonth}`);
      } else {
        console.log(`⚠️  Period mismatch. Expected: ${currentMonth}, Got: ${data.period}`);
      }
    } else {
      const error = await response.json();
      console.log(`❌ Current Month Failed: ${error.error}`);
    }
  } catch (error) {
    console.log(`💥 Current Month Error: ${error.message}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test month formatting
  console.log('🌐 Testing Month Formatting:');
  const testDate = new Date(2024, 11, 1); // December 2024
  const thaiFormat = testDate.toLocaleDateString('th-TH', { 
    year: 'numeric', 
    month: 'long' 
  });
  const isoFormat = testDate.toISOString().substring(0, 7);
  
  console.log(`📅 Test Date: December 2024`);
  console.log(`🇹🇭 Thai Format: ${thaiFormat}`);
  console.log(`🌍 ISO Format: ${isoFormat}`);
  
  console.log('\n✅ Month Selector Test Complete!');
}

// Run the test
testMonthSelector();