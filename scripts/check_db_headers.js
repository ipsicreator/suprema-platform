const xlsx = require('xlsx');
const path = require('path');
const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const workbook = xlsx.readFile(DB_FILE);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
console.log("Headers Row 0:", rows[0]);
console.log("Headers Row 1:", rows[1]);
