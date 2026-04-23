// ============================================================
//  JCB & Spalon — Complaint Management System
//  Google Apps Script Backend
//  Sheet ID: 1pfcrNp3sRkpYk1KggbM5n9AXYBtdUtbfUjvMpCM57Fo
//  Sheet Name: Data
// ============================================================

const SHEET_ID   = '1pfcrNp3sRkpYk1KggbM5n9AXYBtdUtbfUjvMpCM57Fo';
const SHEET_NAME = 'Data';
const ADMIN_SHEET = 'AdminConfig';

// Column order in the sheet (1-indexed)
// ID | Date | Brand | SalonName | AreaManager | ClientName | MailSubject | Category | ComplaintSummary | Status | Remarks | LastUpdated | SubmittedBy

function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

function getAdminSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var s  = ss.getSheetByName(ADMIN_SHEET);
  if (!s) {
    s = ss.insertSheet(ADMIN_SHEET);
    // Seed default values
    s.getRange('A1').setValue('brands');
    s.getRange('A2:A3').setValues([['JCB'],['Spalon']]);
    s.getRange('B1').setValue('salons');
    s.getRange('B2:B3').setValues([['Aundh'],['Bandra Pali']]);
    s.getRange('C1').setValue('managers');
    s.getRange('C2:C3').setValues([['Puneeth'],['Nikita']]);
    s.getRange('D1').setValue('subjects');
    s.getRange('D2:D5').setValues([['CEO Mail'],['Negative Review'],['CEO/Negative'],['Incident Report']]);
    s.getRange('E1').setValue('categories');
    s.getRange('E2:E16').setValues([['Haircut'],['Styling'],['Color'],['Hair Spa'],['Facial'],['Waxing'],['Threading'],['Mani-Pedi'],['Nails'],['Other Service'],['Desk Employee'],['Price Concern'],['Discount'],['Infrastructure'],['Hygiene']]);
  }
  return s;
}

// ── CORS helper ──────────────────────────────────────────────
function makeResponse(data) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ── ROUTER ───────────────────────────────────────────────────
function doGet(e) {
  var action = e.parameter.action;
  try {
    if (action === 'getAll')        return makeResponse(getAllComplaints());
    if (action === 'getConfig')     return makeResponse(getConfig());
    if (action === 'getStats')      return makeResponse(getStats());
    return makeResponse({ error: 'Unknown action' });
  } catch(err) {
    return makeResponse({ error: err.message });
  }
}

function doPost(e) {
  var body   = JSON.parse(e.postData.contents);
  var action = body.action;
  try {
    if (action === 'addComplaint')    return makeResponse(addComplaint(body.data));
    if (action === 'updateStatus')    return makeResponse(updateStatus(body.data));
    if (action === 'addRemark')       return makeResponse(addRemark(body.data));
    if (action === 'bulkUpload')      return makeResponse(bulkUpload(body.data));
    if (action === 'updateConfig')    return makeResponse(updateConfig(body.data));
    if (action === 'deleteComplaint') return makeResponse(deleteComplaint(body.data));
    return makeResponse({ error: 'Unknown action' });
  } catch(err) {
    return makeResponse({ error: err.message });
  }
}

// ── ENSURE HEADERS ───────────────────────────────────────────
function ensureHeaders() {
  var sheet = getSheet();
  if (sheet.getLastRow() === 0 || sheet.getRange('A1').getValue() !== 'ID') {
    sheet.getRange(1, 1, 1, 13).setValues([[
      'ID','Date','Brand','SalonName','AreaManager','ClientName',
      'MailSubject','Category','ComplaintSummary','Status','Remarks','LastUpdated','SubmittedBy'
    ]]);
    sheet.getRange(1,1,1,13).setFontWeight('bold').setBackground('#f3e8d0');
    sheet.setFrozenRows(1);
  }
}

// ── GENERATE ID ──────────────────────────────────────────────
function generateId() {
  var sheet = getSheet();
  var last  = sheet.getLastRow();
  var num   = last; // rows include header
  return 'C-' + String(num).padStart(4, '0');
}

// ── GET ALL ──────────────────────────────────────────────────
function getAllComplaints() {
  ensureHeaders();
  var sheet = getSheet();
  var last  = sheet.getLastRow();
  if (last <= 1) return { success: true, data: [] };
  var rows  = sheet.getRange(2, 1, last - 1, 13).getValues();
  var data  = rows.map(function(r) {
    return {
      id:               r[0],
      date:             r[1] ? Utilities.formatDate(new Date(r[1]), Session.getScriptTimeZone(), 'yyyy-MM-dd') : '',
      brand:            r[2],
      salon:            r[3],
      manager:          r[4],
      client:           r[5],
      subject:          r[6],
      category:         r[7],
      summary:          r[8],
      status:           r[9],
      remarks:          r[10],
      lastUpdated:      r[11] ? Utilities.formatDate(new Date(r[11]), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') : '',
      submittedBy:      r[12]
    };
  }).filter(function(r){ return r.id !== ''; });
  return { success: true, data: data };
}

// ── ADD COMPLAINT ────────────────────────────────────────────
function addComplaint(d) {
  ensureHeaders();
  var sheet = getSheet();
  var id    = generateId();
  var now   = new Date();
  sheet.appendRow([
    id,
    new Date(d.date),
    d.brand,
    d.salon,
    d.manager,
    d.client,
    d.subject,
    d.category,
    d.summary,
    d.status || 'Open',
    d.remarks || '',
    now,
    d.submittedBy || 'Web Form'
  ]);
  // Color-code the status cell
  colorStatusRow(sheet, sheet.getLastRow(), d.status || 'Open');
  return { success: true, id: id };
}

// ── UPDATE STATUS ────────────────────────────────────────────
function updateStatus(d) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === d.id) {
      sheet.getRange(i+1, 10).setValue(d.status);
      sheet.getRange(i+1, 12).setValue(new Date());
      colorStatusRow(sheet, i+1, d.status);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// ── ADD REMARK ───────────────────────────────────────────────
function addRemark(d) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === d.id) {
      var existing = data[i][10] || '';
      var ts       = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd-MMM-yyyy HH:mm');
      var newRemark = '[' + ts + ' — ' + (d.updatedBy || 'User') + ']: ' + d.remark;
      var combined  = existing ? existing + '\n' + newRemark : newRemark;
      sheet.getRange(i+1, 11).setValue(combined);
      sheet.getRange(i+1, 10).setValue(d.status || data[i][9]);
      sheet.getRange(i+1, 12).setValue(new Date());
      colorStatusRow(sheet, i+1, d.status || data[i][9]);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// ── BULK UPLOAD (CSV/existing data) ──────────────────────────
function bulkUpload(rows) {
  ensureHeaders();
  var sheet = getSheet();
  var added = 0;
  rows.forEach(function(d) {
    var id = d.id || generateId();
    sheet.appendRow([
      id,
      d.date ? new Date(d.date) : new Date(),
      d.brand        || '',
      d.salon        || '',
      d.manager      || '',
      d.client       || '',
      d.subject      || '',
      d.category     || '',
      d.summary      || '',
      d.status       || 'Open',
      d.remarks      || '',
      new Date(),
      d.submittedBy  || 'Bulk Upload'
    ]);
    colorStatusRow(sheet, sheet.getLastRow(), d.status || 'Open');
    added++;
  });
  return { success: true, added: added };
}

// ── DELETE ───────────────────────────────────────────────────
function deleteComplaint(d) {
  var sheet = getSheet();
  var data  = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === d.id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Not found' };
}

// ── CONFIG (dropdowns) ───────────────────────────────────────
function getConfig() {
  var s = getAdminSheet();
  function col(c) {
    var last = s.getLastRow();
    if (last < 2) return [];
    return s.getRange(2, c, last - 1, 1).getValues()
             .map(function(r){ return r[0]; })
             .filter(function(v){ return v !== ''; });
  }
  return {
    success:    true,
    brands:     col(1),
    salons:     col(2),
    managers:   col(3),
    subjects:   col(4),
    categories: col(5)
  };
}

function updateConfig(d) {
  var s    = getAdminSheet();
  var cols = { brands:1, salons:2, managers:3, subjects:4, categories:5 };
  var col  = cols[d.key];
  if (!col) return { success: false, error: 'Unknown key' };
  // Clear column from row 2
  var last = s.getLastRow();
  if (last >= 2) s.getRange(2, col, last - 1, 1).clearContent();
  if (d.values && d.values.length) {
    s.getRange(2, col, d.values.length, 1)
     .setValues(d.values.map(function(v){ return [v]; }));
  }
  return { success: true };
}

// ── STATS ────────────────────────────────────────────────────
function getStats() {
  var all    = getAllComplaints().data;
  var total  = all.length;
  var open   = all.filter(function(r){ return r.status === 'Open'; }).length;
  var pending= all.filter(function(r){ return r.status === 'Pending Follow Up'; }).length;
  var resolved = all.filter(function(r){ return r.status === 'Resolved'; }).length;

  // Category breakdown
  var catMap = {};
  all.forEach(function(r){
    catMap[r.category] = (catMap[r.category] || 0) + 1;
  });

  // Salon breakdown
  var salonMap = {};
  all.forEach(function(r){
    salonMap[r.salon] = (salonMap[r.salon] || 0) + 1;
  });

  // Brand breakdown
  var brandMap = {};
  all.forEach(function(r){
    brandMap[r.brand] = (brandMap[r.brand] || 0) + 1;
  });

  return {
    success: true,
    total: total, open: open, pending: pending, resolved: resolved,
    byCategory: catMap,
    bySalon:    salonMap,
    byBrand:    brandMap
  };
}

// ── COLOR ROWS BY STATUS ─────────────────────────────────────
function colorStatusRow(sheet, rowNum, status) {
  var colors = { 'Open': '#fce8e8', 'Pending Follow Up': '#fef3e2', 'Resolved': '#e8f5ee' };
  var c = colors[status] || '#ffffff';
  sheet.getRange(rowNum, 1, 1, 13).setBackground(c);
}
