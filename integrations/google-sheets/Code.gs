/** Paste into Code.gs in ONE Google Apps Script project owned by the club. */
const CLUB = {
  contactSheet: '1-k2MvrFu2lvOq0ypMJCo-Zs_Q2lw3MD7_sTNAXUi6rc',
  joinSheet: '1v6RYlzZujoRSAHvOwsY_FQ7X5s3UOHW8E9b3SGxzcWg',
  supabaseUrl: 'https://jxweaxenswbjpxxjmihb.supabase.co',
  contactTab: 'رسائل الموقع',
  joinTab: 'طلبات الموقع',
};
const MAJORS = [
  'تصميم و برمجة تطبيقات الموبايل',
  'تصميم و برمجة الألعاب الموبايل',
  'تصميم و برمجة صفحات الويب',
  'تكنولوجيا الوسائط المتعددة',
];
const HEADERS = {
  contact: ['معرّف الطلب', 'التاريخ', 'الاسم', 'البريد الإلكتروني', 'الرسالة'],
  join: ['معرّف الطلب', 'التاريخ', 'الاسم الكامل', 'البريد الإلكتروني', 'الهاتف', 'الرقم الجامعي', 'التخصص', 'اللجنة', 'عرّفنا بنفسك'],
};

function response_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
function fail_(code) { throw new Error(code); }
function errorResponse_(error) {
  const known = ['INVALID_INPUT', 'UNAUTHORIZED', 'JOIN_CLOSED', 'ALREADY_REGISTERED', 'BUSY', 'NOT_CONFIGURED', 'SHEET_HEADERS_CHANGED'];
  const code = known.indexOf(error.message) >= 0 ? error.message : 'SERVER_ERROR';
  return response_({ ok: false, code: code });
}
function locked_(operation) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) fail_('BUSY');
  try { return operation(); } finally { lock.releaseLock(); }
}
function sheet_(kind) {
  const contact = kind === 'contact';
  const book = SpreadsheetApp.openById(contact ? CLUB.contactSheet : CLUB.joinSheet);
  const name = contact ? CLUB.contactTab : CLUB.joinTab;
  let sheet = book.getSheetByName(name);
  if (!sheet) sheet = book.insertSheet(name);
  const headers = HEADERS[kind];
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.setRightToLeft(true);
  } else {
    const actual = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (JSON.stringify(actual) !== JSON.stringify(headers)) fail_('SHEET_HEADERS_CHANGED');
  }
  return sheet;
}
function settings_() {
  const raw = PropertiesService.getScriptProperties().getProperty('JOIN_SETTINGS');
  return raw ? JSON.parse(raw) : { enabled: false, limit: 40 };
}
function status_() {
  const config = settings_();
  const sheet = sheet_('join');
  const count = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues().filter(function(row) { return !!row[0]; }).length : 0;
  return { open: config.enabled && count < config.limit, enabled: config.enabled, limit: config.limit, count: count, remaining: Math.max(0, config.limit - count) };
}
/** Run ONCE from the Apps Script editor to authorize access to both spreadsheets. */
function setup() {
  return locked_(function() {
    sheet_('contact'); sheet_('join');
    if (!PropertiesService.getScriptProperties().getProperty('JOIN_SETTINGS')) {
      PropertiesService.getScriptProperties().setProperty('JOIN_SETTINGS', JSON.stringify({ enabled: false, limit: 40 }));
    }
    return status_();
  });
}
/** Public endpoint exposes only registration availability and counts, never personal data. */
function doGet() {
  try { return response_({ ok: true, registration: locked_(status_) }); }
  catch (error) { return errorResponse_(error); }
}
function text_(data, key, min, max) {
  if (typeof data[key] !== 'string') fail_('INVALID_INPUT');
  const value = data[key].trim();
  if (value.length < min || value.length > max) fail_('INVALID_INPUT');
  return value;
}
function validate_(kind, data) {
  const email = text_(data, 'email', 3, 254);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail_('INVALID_INPUT');
  const message = text_(data, 'message', 10, 4000);
  if (kind === 'contact') return [text_(data, 'name', 2, 200), email, message];
  const studentId = text_(data, 'studentId', 9, 9);
  const major = text_(data, 'major', 2, 200);
  const committee = text_(data, 'preferredCommittee', 2, 30);
  if (!/^[0-9]{9}$/.test(studentId) || MAJORS.indexOf(major) < 0 || ['media', 'relations', 'activities'].indexOf(committee) < 0) fail_('INVALID_INPUT');
  return [text_(data, 'fullName', 2, 200), email, text_(data, 'phone', 0, 30), studentId, major, committee, message];
}
function exists_(sheet, column, value) {
  if (sheet.getLastRow() < 2) return false;
  return sheet.getRange(2, column, sheet.getLastRow() - 1, 1).getDisplayValues().some(function(row) { return row[0] === value; });
}
function append_(sheet, values) {
  // Rich text writes user input as literal text, not executable spreadsheet formulas.
  const cells = values.map(function(value) { return SpreadsheetApp.newRichTextValue().setText(String(value)).build(); });
  sheet.getRange(sheet.getLastRow() + 1, 1, 1, cells.length).setRichTextValues([cells]).setWrap(true);
  SpreadsheetApp.flush();
}
function requireAdmin_(token) {
  if (typeof token !== 'string' || token.length < 20 || token.length > 10000) fail_('UNAUTHORIZED');
  const key = PropertiesService.getScriptProperties().getProperty('SUPABASE_PUBLISHABLE_KEY');
  if (!key) fail_('NOT_CONFIGURED');
  const options = { headers: { apikey: key, Authorization: 'Bearer ' + token }, muteHttpExceptions: true };
  // Validate the session on Supabase; never trust a role or user ID supplied by the browser.
  const auth = UrlFetchApp.fetch(CLUB.supabaseUrl + '/auth/v1/user', options);
  if (auth.getResponseCode() !== 200) fail_('UNAUTHORIZED');
  const user = JSON.parse(auth.getContentText());
  if (!user.id) fail_('UNAUTHORIZED');
  const result = UrlFetchApp.fetch(CLUB.supabaseUrl + '/rest/v1/club_admins?select=role&id=eq.' + encodeURIComponent(user.id), options);
  if (result.getResponseCode() !== 200) fail_('UNAUTHORIZED');
  const rows = JSON.parse(result.getContentText());
  if (!rows.length || rows[0].role !== 'super_admin') fail_('UNAUTHORIZED');
}
/** POST JSON as text/plain. action: contact, join, or configure. */
function doPost(event) {
  try {
    if (!event || !event.postData || event.postData.contents.length > 20000) fail_('INVALID_INPUT');
    let body;
    try { body = JSON.parse(event.postData.contents); } catch (_) { fail_('INVALID_INPUT'); }
    if (!body || typeof body !== 'object') fail_('INVALID_INPUT');
    if (body.action === 'configure') {
      requireAdmin_(body.accessToken);
      if (typeof body.enabled !== 'boolean' || !Number.isInteger(body.limit) || body.limit < 1 || body.limit > 100000) fail_('INVALID_INPUT');
      return response_(locked_(function() {
        PropertiesService.getScriptProperties().setProperty('JOIN_SETTINGS', JSON.stringify({ enabled: body.enabled, limit: body.limit }));
        return { ok: true, registration: status_() };
      }));
    }
    if (body.action !== 'contact' && body.action !== 'join') fail_('INVALID_INPUT');
    if (typeof body.requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.requestId)) fail_('INVALID_INPUT');
    if (!body.data || typeof body.data !== 'object') fail_('INVALID_INPUT');
    const values = validate_(body.action, body.data);
    return response_(locked_(function() {
      const sheet = sheet_(body.action);
      // Reusing the request UUID after a network failure cannot create another row.
      if (exists_(sheet, 1, body.requestId)) return { ok: true, duplicate: true };
      if (body.action === 'join') {
        if (!status_().open) fail_('JOIN_CLOSED');
        if (exists_(sheet, 6, values[3])) fail_('ALREADY_REGISTERED');
      }
      append_(sheet, [body.requestId, new Date().toISOString()].concat(values));
      return { ok: true, registration: body.action === 'join' ? status_() : undefined };
    }));
  } catch (error) { return errorResponse_(error); }
}
