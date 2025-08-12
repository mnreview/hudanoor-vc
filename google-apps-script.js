// Google Apps Script สำหรับ HUDANOOR ระบบบันทึกรายรับ-รายจ่าย
// คัดลอกโค้ดนี้ไปใส่ใน Google Apps Script Editor
// แก้ไข SPREADSHEET_ID ให้ตรงกับ Google Sheets ของคุณ

// ตั้งค่า Spreadsheet ID - แก้ไขให้ตรงกับของคุณ
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

// ชื่อ Sheet
var INCOME_SHEET = 'รายรับ';
var EXPENSE_SHEET = 'รายจ่าย';
var TASK_SHEET = 'TaskReminder';
var SETTINGS_SHEET = 'Settings';
var EMPLOYEES_SHEET = 'Employees';
var UPDATE_LOGS_SHEET = 'UpdateLogs';

// Headers สำหรับ Income Sheet
var INCOME_HEADERS = [
  'ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'ชื่อสินค้า', 
  'หมวดหมู่สินค้า', 'จำนวน', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
];

// Headers สำหรับ Expense Sheet
var EXPENSE_HEADERS = [
  'ID', 'วันที่', 'ช่องทาง', 'สาขา/แพลตฟอร์ม', 'รายการค่าใช้จ่าย', 
  'หมวดหมู่ค่าใช้จ่าย', 'ยอดเงิน', 'หมายเหตุ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
];

// Headers สำหรับ Task Reminder Sheet
var TASK_HEADERS = [
  'ID', 'รายการ', 'ประเภท', 'จำนวนเงิน', 'หมายเหตุ', 'กำหนดวัน', 'สถานะ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
];

// Headers สำหรับ Settings Sheet
var SETTINGS_HEADERS = [
  'ID', 'ชื่อร้าน', 'ชื่อเว็บไซต์', 'สโลแกน', 'สีหลัก', 'ที่อยู่', 'เบอร์โทร', 'อีเมล', 
  'สกุลเงิน', 'รูปแบบวันที่', 'เป้าหมายยอดขาย', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
];

// Headers สำหรับ Employees Sheet
var EMPLOYEES_HEADERS = [
  'ID', 'ชื่อ-นามสกุล', 'ตำแหน่ง', 'เงินเดือน', 'คอมหน้าร้าน%', 'คอมออนไลน์%', 
  'วันเริ่มงาน', 'เบอร์โทร', 'อีเมล', 'ที่อยู่', 'หมายเหตุ', 'สถานะ', 'สร้างเมื่อ', 'แก้ไขเมื่อ'
];

// Headers สำหรับ Update Logs Sheet
var UPDATE_LOGS_HEADERS = [
  'ID', 'เวอร์ชั่น', 'วันที่', 'หัวข้อ', 'รายละเอียด', 'ประเภท', 'สำคัญ', 'สร้างเมื่อ'
];

// ฟังก์ชันหลักสำหรับ HTTP GET
function doGet(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback;
  
  try {
    var result;
    switch (action) {
      case 'getIncome':
        result = getIncomeData(callback);
        break;
      case 'getExpense':
        result = getExpenseData(callback);
        break;
      case 'addIncome':
        var incomeData = JSON.parse(e.parameter.data);
        result = addIncomeRecord(incomeData, callback);
        break;
      case 'addExpense':
        var expenseData = JSON.parse(e.parameter.data);
        result = addExpenseRecord(expenseData, callback);
        break;
      case 'initializeSheets':
        result = initializeSheets(callback);
        break;
      case 'getTasks':
        result = getTasksData(callback);
        break;
      case 'addTask':
        var taskData = JSON.parse(e.parameter.data);
        result = addTaskRecord(taskData, callback);
        break;
      case 'updateTask':
        var updateData = JSON.parse(e.parameter.data);
        result = updateTaskRecord(updateData, callback);
        break;
      case 'deleteTask':
        var taskId = e.parameter.taskId;
        result = deleteTaskRecord(taskId, callback);
        break;
      case 'getSettings':
        result = getSettingsData(callback);
        break;
      case 'saveSettings':
        var settingsData = JSON.parse(e.parameter.data);
        result = saveSettingsData(settingsData, callback);
        break;
      case 'getEmployees':
        result = getEmployeesData(callback);
        break;
      case 'addEmployee':
        var employeeData = JSON.parse(e.parameter.data);
        result = addEmployeeRecord(employeeData, callback);
        break;
      case 'updateEmployee':
        var updateEmployeeData = JSON.parse(e.parameter.data);
        result = updateEmployeeRecord(updateEmployeeData, callback);
        break;
      case 'deleteEmployee':
        var employeeId = e.parameter.employeeId;
        result = deleteEmployeeRecord(employeeId, callback);
        break;
      case 'getUpdateLogs':
        result = getUpdateLogsData(callback);
        break;
      case 'addUpdateLog':
        var logData = JSON.parse(e.parameter.data);
        result = addUpdateLogRecord(logData, callback);
        break;
      case 'updateUpdateLog':
        var updateLogData = JSON.parse(e.parameter.data);
        result = updateUpdateLogRecord(updateLogData, callback);
        break;
      case 'deleteUpdateLog':
        var logId = e.parameter.logId;
        result = deleteUpdateLogRecord(logId, callback);
        break;
      default:
        var errorResult = { error: 'Invalid action' };
        if (callback) {
          result = ContentService
            .createTextOutput(callback + '(' + JSON.stringify(errorResult) + ');')
            .setMimeType(ContentService.MimeType.JAVASCRIPT);
        } else {
          result = ContentService
            .createTextOutput(JSON.stringify(errorResult))
            .setMimeType(ContentService.MimeType.JSON);
        }
    }
    
    return result;
  } catch (error) {
    var errorResult = { error: error.toString() };
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(errorResult) + ');')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify(errorResult))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

// ฟังก์ชันหลักสำหรับ HTTP POST
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = data.action;
    
    var result;
    switch (action) {
      case 'addIncome':
        result = addIncomeRecord(data.data);
        break;
      case 'addExpense':
        result = addExpenseRecord(data.data);
        break;
      case 'initializeSheets':
        result = initializeSheets();
        break;
      default:
        result = ContentService
          .createTextOutput(JSON.stringify({ error: 'Invalid action' }))
          .setMimeType(ContentService.MimeType.JSON);
    }
    
    // เพิ่ม CORS headers
    return result.setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
  }
}

// จัดการ OPTIONS request สำหรับ CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

// อ่านข้อมูลรายรับ
function getIncomeData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(INCOME_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + INCOME_SHEET + '" not found');
  }
  
  var values = sheet.getDataRange().getValues();
  var result = { values: values };
  
  if (callback) {
    // JSONP response
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Regular JSON response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// อ่านข้อมูลรายจ่าย
function getExpenseData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EXPENSE_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + EXPENSE_SHEET + '" not found');
  }
  
  var values = sheet.getDataRange().getValues();
  var result = { values: values };
  
  if (callback) {
    // JSONP response
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    // Regular JSON response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่มข้อมูลรายรับ
function addIncomeRecord(incomeData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(INCOME_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + INCOME_SHEET + '" not found');
  }
  
  var id = 'income_' + Date.now();
  var now = new Date().toISOString();
  
  var rowData = [
    id,
    incomeData.date,
    incomeData.channel,
    incomeData.branch_or_platform,
    incomeData.product_name,
    incomeData.product_category,
    incomeData.quantity,
    incomeData.amount,
    incomeData.note || '',
    now,
    now
  ];
  
  sheet.appendRow(rowData);
  
  var result = { success: true, id: id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่มข้อมูลรายจ่าย
function addExpenseRecord(expenseData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EXPENSE_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + EXPENSE_SHEET + '" not found');
  }
  
  var id = 'expense_' + Date.now();
  var now = new Date().toISOString();
  
  var rowData = [
    id,
    expenseData.date,
    expenseData.channel,
    expenseData.branch_or_platform,
    expenseData.expense_item,
    expenseData.expense_category,
    expenseData.cost,
    expenseData.note || '',
    now,
    now
  ];
  
  sheet.appendRow(rowData);
  
  var result = { success: true, id: id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ตั้งค่า Headers ใน Sheets
function initializeSheets(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // สร้างหรือตั้งค่า Income Sheet
  var incomeSheet = spreadsheet.getSheetByName(INCOME_SHEET);
  if (!incomeSheet) {
    incomeSheet = spreadsheet.insertSheet(INCOME_SHEET);
  }
  
  // ตั้งค่า Headers สำหรับ Income Sheet
  var incomeRange = incomeSheet.getRange(1, 1, 1, INCOME_HEADERS.length);
  incomeRange.setValues([INCOME_HEADERS]);
  incomeRange.setFontWeight('bold');
  incomeRange.setBackground('#f0f0f0');
  
  // สร้างหรือตั้งค่า Expense Sheet
  var expenseSheet = spreadsheet.getSheetByName(EXPENSE_SHEET);
  if (!expenseSheet) {
    expenseSheet = spreadsheet.insertSheet(EXPENSE_SHEET);
  }
  
  // ตั้งค่า Headers สำหรับ Expense Sheet
  var expenseRange = expenseSheet.getRange(1, 1, 1, EXPENSE_HEADERS.length);
  expenseRange.setValues([EXPENSE_HEADERS]);
  expenseRange.setFontWeight('bold');
  expenseRange.setBackground('#f0f0f0');
  
  // สร้างหรือตั้งค่า Task Sheet
  var taskSheet = spreadsheet.getSheetByName(TASK_SHEET);
  if (!taskSheet) {
    taskSheet = spreadsheet.insertSheet(TASK_SHEET);
  }
  
  // ตั้งค่า Headers สำหรับ Task Sheet
  var taskRange = taskSheet.getRange(1, 1, 1, TASK_HEADERS.length);
  taskRange.setValues([TASK_HEADERS]);
  taskRange.setFontWeight('bold');
  taskRange.setBackground('#f0f0f0');
  
  var result = { success: true, message: 'Sheets initialized successfully' };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// อ่านข้อมูล Tasks
function getTasksData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(TASK_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + TASK_SHEET + '" not found');
  }
  
  var values = sheet.getDataRange().getValues();
  var result = { values: values };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่ม Task ใหม่
function addTaskRecord(taskData, callback) {
  console.log('addTaskRecord called with:', taskData);
  
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(TASK_SHEET);
  
  if (!sheet) {
    console.log('Creating new TaskReminder sheet');
    sheet = spreadsheet.insertSheet(TASK_SHEET);
    sheet.getRange(1, 1, 1, TASK_HEADERS.length).setValues([TASK_HEADERS]);
  }
  
  var id = 'task_' + Date.now();
  var now = new Date().toISOString();
  
  var rowData = [
    id,
    taskData.title,
    taskData.type,
    taskData.amount,
    taskData.note || '',
    taskData.dueDate,
    taskData.completed ? 'เสร็จแล้ว' : 'รอดำเนินการ',
    now,
    now
  ];
  
  console.log('Adding row data:', rowData);
  sheet.appendRow(rowData);
  console.log('Task added successfully to sheet');
  
  var result = { success: true, id: id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// อัปเดต Task (สำหรับเปลี่ยนสถานะหรือแก้ไข)
function updateTaskRecord(updateData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(TASK_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + TASK_SHEET + '" not found');
  }
  
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หา row ที่ต้องอัปเดต
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === updateData.id) {
      rowIndex = i + 1; // +1 เพราะ getRange เริ่มจาก 1
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Task not found');
  }
  
  var now = new Date().toISOString();
  
  // อัปเดตข้อมูล
  if (updateData.title !== undefined) sheet.getRange(rowIndex, 2).setValue(updateData.title);
  if (updateData.type !== undefined) sheet.getRange(rowIndex, 3).setValue(updateData.type);
  if (updateData.amount !== undefined) sheet.getRange(rowIndex, 4).setValue(updateData.amount);
  if (updateData.note !== undefined) sheet.getRange(rowIndex, 5).setValue(updateData.note);
  if (updateData.dueDate !== undefined) sheet.getRange(rowIndex, 6).setValue(updateData.dueDate);
  if (updateData.completed !== undefined) {
    sheet.getRange(rowIndex, 7).setValue(updateData.completed ? 'เสร็จแล้ว' : 'รอดำเนินการ');
  }
  sheet.getRange(rowIndex, 9).setValue(now); // แก้ไขเมื่อ
  
  var result = { success: true, id: updateData.id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ลบ Task
function deleteTaskRecord(taskId, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(TASK_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + TASK_SHEET + '" not found');
  }
  
  var values = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หา row ที่ต้องลบ
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === taskId) {
      rowIndex = i + 1; // +1 เพราะ deleteRow เริ่มจาก 1
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Task not found');
  }
  
  sheet.deleteRow(rowIndex);
  
  var result = { success: true, id: taskId };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
// ====
================ SETTINGS FUNCTIONS ====================

// อ่านข้อมูลการตั้งค่า
function getSettingsData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SETTINGS_SHEET);
  
  if (!sheet) {
    // สร้าง sheet ใหม่ถ้าไม่มี
    sheet = spreadsheet.insertSheet(SETTINGS_SHEET);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setValues([SETTINGS_HEADERS]);
    
    // เพิ่มข้อมูลเริ่มต้น
    var defaultSettings = [
      'default',
      'HUDANOOR',
      'ระบบบันทึกรายรับ-รายจ่าย',
      'เสื้อผ้าแฟชั่นมุสลิม',
      '#e11d48',
      '',
      '',
      '',
      'THB',
      'DD/MM/YYYY',
      15000,
      new Date().toISOString(),
      new Date().toISOString()
    ];
    sheet.appendRow(defaultSettings);
  }
  
  var data = sheet.getDataRange().getValues();
  
  var result = { values: data };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// บันทึกการตั้งค่า
function saveSettingsData(settingsData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(SETTINGS_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SETTINGS_SHEET);
    sheet.getRange(1, 1, 1, SETTINGS_HEADERS.length).setValues([SETTINGS_HEADERS]);
  }
  
  var now = new Date().toISOString();
  
  // ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่
  var data = sheet.getDataRange().getValues();
  var settingsRow = -1;
  
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === 'default') {
      settingsRow = i + 1;
      break;
    }
  }
  
  var rowData = [
    'default',
    settingsData.storeName || '',
    settingsData.websiteName || '',
    settingsData.storeSlogan || '',
    settingsData.primaryColor || '#e11d48',
    settingsData.storeAddress || '',
    settingsData.storePhone || '',
    settingsData.storeEmail || '',
    settingsData.currency || 'THB',
    settingsData.dateFormat || 'DD/MM/YYYY',
    settingsData.defaultSalesTarget || 15000,
    data.length > 1 ? data[settingsRow - 1][11] : now, // เก็บ createdAt เดิม
    now // updatedAt ใหม่
  ];
  
  if (settingsRow > 0) {
    // อัปเดตข้อมูลเดิม
    sheet.getRange(settingsRow, 1, 1, rowData.length).setValues([rowData]);
  } else {
    // เพิ่มข้อมูลใหม่
    sheet.appendRow(rowData);
  }
  
  var result = { success: true, updatedAt: now };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== EMPLOYEES FUNCTIONS ====================

// อ่านข้อมูลพนักงาน
function getEmployeesData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EMPLOYEES_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(EMPLOYEES_SHEET);
    sheet.getRange(1, 1, 1, EMPLOYEES_HEADERS.length).setValues([EMPLOYEES_HEADERS]);
  }
  
  var data = sheet.getDataRange().getValues();
  
  var result = { values: data };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่มพนักงานใหม่
function addEmployeeRecord(employeeData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EMPLOYEES_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(EMPLOYEES_SHEET);
    sheet.getRange(1, 1, 1, EMPLOYEES_HEADERS.length).setValues([EMPLOYEES_HEADERS]);
  }
  
  var id = 'emp_' + Date.now();
  var now = new Date().toISOString();
  
  var rowData = [
    id,
    employeeData.name,
    employeeData.position,
    employeeData.salary,
    employeeData.storeCommission,
    employeeData.onlineCommission,
    employeeData.startDate || now,
    employeeData.phone || '',
    employeeData.email || '',
    employeeData.address || '',
    employeeData.note || '',
    employeeData.isActive ? 'ทำงานอยู่' : 'ไม่ทำงานแล้ว',
    now,
    now
  ];
  
  sheet.appendRow(rowData);
  
  var result = { success: true, id: id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// อัปเดตข้อมูลพนักงาน
function updateEmployeeRecord(updateData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EMPLOYEES_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + EMPLOYEES_SHEET + '" not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หาแถวที่ต้องอัปเดต
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === updateData.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Employee not found');
  }
  
  var now = new Date().toISOString();
  
  // อัปเดตข้อมูล
  if (updateData.name !== undefined) sheet.getRange(rowIndex, 2).setValue(updateData.name);
  if (updateData.position !== undefined) sheet.getRange(rowIndex, 3).setValue(updateData.position);
  if (updateData.salary !== undefined) sheet.getRange(rowIndex, 4).setValue(updateData.salary);
  if (updateData.storeCommission !== undefined) sheet.getRange(rowIndex, 5).setValue(updateData.storeCommission);
  if (updateData.onlineCommission !== undefined) sheet.getRange(rowIndex, 6).setValue(updateData.onlineCommission);
  if (updateData.phone !== undefined) sheet.getRange(rowIndex, 8).setValue(updateData.phone);
  if (updateData.email !== undefined) sheet.getRange(rowIndex, 9).setValue(updateData.email);
  if (updateData.address !== undefined) sheet.getRange(rowIndex, 10).setValue(updateData.address);
  if (updateData.note !== undefined) sheet.getRange(rowIndex, 11).setValue(updateData.note);
  if (updateData.isActive !== undefined) sheet.getRange(rowIndex, 12).setValue(updateData.isActive ? 'ทำงานอยู่' : 'ไม่ทำงานแล้ว');
  
  // อัปเดตเวลา
  sheet.getRange(rowIndex, 14).setValue(now);
  
  var result = { success: true };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ลบพนักงาน
function deleteEmployeeRecord(employeeId, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(EMPLOYEES_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + EMPLOYEES_SHEET + '" not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หาแถวที่ต้องลบ
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === employeeId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Employee not found');
  }
  
  sheet.deleteRow(rowIndex);
  
  var result = { success: true };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== UPDATE LOGS FUNCTIONS ====================

// อ่านข้อมูล Update Logs
function getUpdateLogsData(callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(UPDATE_LOGS_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(UPDATE_LOGS_SHEET);
    sheet.getRange(1, 1, 1, UPDATE_LOGS_HEADERS.length).setValues([UPDATE_LOGS_HEADERS]);
  }
  
  var data = sheet.getDataRange().getValues();
  
  var result = { values: data };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// เพิ่ม Update Log ใหม่
function addUpdateLogRecord(logData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(UPDATE_LOGS_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(UPDATE_LOGS_SHEET);
    sheet.getRange(1, 1, 1, UPDATE_LOGS_HEADERS.length).setValues([UPDATE_LOGS_HEADERS]);
  }
  
  var id = 'log_' + Date.now();
  var now = new Date().toISOString();
  
  var rowData = [
    id,
    logData.version,
    logData.date,
    logData.title,
    logData.description,
    logData.type,
    logData.isImportant ? 'สำคัญ' : 'ปกติ',
    now
  ];
  
  sheet.appendRow(rowData);
  
  var result = { success: true, id: id };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// อัปเดต Update Log
function updateUpdateLogRecord(updateData, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(UPDATE_LOGS_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + UPDATE_LOGS_SHEET + '" not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หาแถวที่ต้องอัปเดต
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === updateData.id) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Update log not found');
  }
  
  // อัปเดตข้อมูล
  if (updateData.version !== undefined) sheet.getRange(rowIndex, 2).setValue(updateData.version);
  if (updateData.date !== undefined) sheet.getRange(rowIndex, 3).setValue(updateData.date);
  if (updateData.title !== undefined) sheet.getRange(rowIndex, 4).setValue(updateData.title);
  if (updateData.description !== undefined) sheet.getRange(rowIndex, 5).setValue(updateData.description);
  if (updateData.type !== undefined) sheet.getRange(rowIndex, 6).setValue(updateData.type);
  if (updateData.isImportant !== undefined) sheet.getRange(rowIndex, 7).setValue(updateData.isImportant ? 'สำคัญ' : 'ปกติ');
  
  var result = { success: true };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ลบ Update Log
function deleteUpdateLogRecord(logId, callback) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(UPDATE_LOGS_SHEET);
  
  if (!sheet) {
    throw new Error('Sheet "' + UPDATE_LOGS_SHEET + '" not found');
  }
  
  var data = sheet.getDataRange().getValues();
  var rowIndex = -1;
  
  // หาแถวที่ต้องลบ
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === logId) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) {
    throw new Error('Update log not found');
  }
  
  sheet.deleteRow(rowIndex);
  
  var result = { success: true };
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}