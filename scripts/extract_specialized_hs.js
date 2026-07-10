const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const inputExcelPath = 'c:/Users/chris/Desktop/suprema-platform/data/2027학년도_수시전형_최종_교정완료본.xlsx';
const parsedJsonPath = 'c:/Users/chris/Desktop/suprema-platform/scratch/parsed_records.json';
const outputPath = 'c:/Users/chris/Desktop/suprema-platform/data/2027학년도_수시전형_특성화고_지원가능대학.xlsx';
const finalOutputPath = 'c:/Users/chris/Desktop/suprema-platform/data/2027학년도_수시전형_특성화고_최종정리.xlsx';

console.log("[1/3] 데이터 양식 및 파싱된 PDF 데이터 로드 중...");

// 1. Load headers (Row 0 and 1) from the template Excel
if (!fs.existsSync(inputExcelPath)) {
    console.error("Template file not found:", inputExcelPath);
    process.exit(1);
}
const templateWorkbook = xlsx.readFile(inputExcelPath);
const firstSheetName = templateWorkbook.SheetNames[0];
const sheet = templateWorkbook.Sheets[firstSheetName];
const rawRows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

if (rawRows.length < 2) {
    console.error("Template does not contain headers in row 0 and 1.");
    process.exit(1);
}
const headers = [rawRows[0], rawRows[1]];
const numCols = rawRows[1].length;
console.log(`- 템플릿 헤더 로드 완료 (컬럼 수: ${numCols})`);

// 2. Load PDF parsed records (100% PDF source of truth)
if (!fs.existsSync(parsedJsonPath)) {
    console.error("Parsed PDF JSON not found at:", parsedJsonPath);
    process.exit(1);
}
const { susiRecords, jungsiRecords } = JSON.parse(fs.readFileSync(parsedJsonPath, 'utf8'));
console.log(`- PDF 파싱 데이터 로드 완료 - 수시: ${susiRecords.length}건, 정시: ${jungsiRecords.length}건`);

// 3. Map columns to headers
const headerRow = headers[1];
const COL_REGION = headerRow.findIndex(h => h === '광역' || h === '지역');
const COL_SUBREGION = headerRow.findIndex(h => h === '기초' || h === '세부지역');
const COL_UNIV = headerRow.findIndex(h => h === '대학교' || h === '대학');
const COL_DEPT = headerRow.findIndex(h => h === '모집단위명' || h === '모집단위');
const COL_TYPE = headerRow.findIndex(h => h === '전형유형');
const COL_NAME = headerRow.findIndex(h => h === '전형명');
const COL_ELIGIBILITY = headerRow.findIndex(h => h === '지원자격');
const COL_QUOTA = headerRow.findIndex(h => h === '모집인원');
const COL_METHOD = headerRow.findIndex(h => h === '전형방법');
const COL_REMARKS = headerRow.findIndex(h => h === '비고');

// Helper to map parsed record to a 44-column array
function recordToRow(item, isJungsi) {
    const row = Array(numCols).fill('');
    
    if (COL_REGION !== -1) row[COL_REGION] = item.region || '';
    if (COL_SUBREGION !== -1) row[COL_SUBREGION] = item.subRegion || '';
    if (COL_UNIV !== -1) row[COL_UNIV] = item.univ || '';
    
    // Fill department/major as "전체" (as per pure PDF extraction rules)
    if (COL_DEPT !== -1) row[COL_DEPT] = '전체';
    
    if (COL_TYPE !== -1) row[COL_TYPE] = item.type || (isJungsi ? '수능' : '종합');
    if (COL_NAME !== -1) row[COL_NAME] = item.trackName || '';
    if (COL_ELIGIBILITY !== -1) {
        row[COL_ELIGIBILITY] = '특성화고교 졸업(예정)자';
    }
    if (COL_QUOTA !== -1) row[COL_QUOTA] = item.quota || '';
    if (COL_METHOD !== -1) row[COL_METHOD] = item.method || '';
    
    if (COL_REMARKS !== -1) {
        if (isJungsi && item.group) {
            row[COL_REMARKS] = `모집군: ${item.group}군`;
        } else {
            row[COL_REMARKS] = item.remarks || '';
        }
    }

    return row;
}

console.log("[2/3] 44개 컬럼 구조로 데이터 매핑 중...");
const susiRows = susiRecords.map(item => recordToRow(item, false));
const jungsiRows = jungsiRecords.map(item => recordToRow(item, true));

// 4. Create Workbook and Sheets
console.log("[3/3] 엑셀 파일 생성 및 저장 중...");
const workbook = xlsx.utils.book_new();

const susiData = [headers[0], headers[1], ...susiRows];
const susiSheet = xlsx.utils.aoa_to_sheet(susiData);
xlsx.utils.book_append_sheet(workbook, susiSheet, '수시');

const jungsiData = [headers[0], headers[1], ...jungsiRows];
const jungsiSheet = xlsx.utils.aoa_to_sheet(jungsiData);
xlsx.utils.book_append_sheet(workbook, jungsiSheet, '정시');

// Save files
xlsx.writeFile(workbook, outputPath);
xlsx.writeFile(workbook, finalOutputPath);

console.log(`[완료] 특성화고 지원 가능 전형 정리 완료!`);
console.log(`  - 저장 경로 1: ${outputPath}`);
console.log(`  - 저장 경로 2: ${finalOutputPath}`);
console.log(`  - 수시 레코드 수: ${susiRows.length}개`);
console.log(`  - 정시 레코드 수: ${jungsiRows.length}개`);
