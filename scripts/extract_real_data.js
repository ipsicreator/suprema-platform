const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const INPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_지원가능대학.xlsx');

async function extractRealData() {
    console.log("=== 특성화고 실제 데이터 추출 시작 ===");
    console.log(`원본 데이터 로딩: ${INPUT_FILE}`);
    
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error("원본 엑셀 파일이 존재하지 않습니다.");
    }

    const workbook = xlsx.readFile(INPUT_FILE);
    const sheetName = workbook.SheetNames[0]; // '전체'
    const sheet = workbook.Sheets[sheetName];
    
    // header: 1 to get array of arrays
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    if (rows.length < 2) {
        throw new Error("원본 데이터가 너무 적거나 없습니다.");
    }

    const headers = rows[0]; // Assuming 1st row is header
    
    // Find index for '지원자격'
    let eligibleIdx = headers.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');
    if (eligibleIdx === -1) {
        console.warn("'지원자격' 컬럼을 찾지 못해 두 번째 줄을 헤더로 탐색합니다.");
        const headers2 = rows[1];
        eligibleIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');
        if (eligibleIdx === -1) {
            throw new Error("지원자격 컬럼을 엑셀 파일에서 찾을 수 없습니다.");
        }
    }

    console.log(`지원자격 컬럼 인덱스: ${eligibleIdx}`);
    
    // Find index for '전형명' as well
    let trackIdx = headers.findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');
    if (trackIdx === -1) {
        trackIdx = rows[1].findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');
    }

    const extractedRows = [];
    extractedRows.push(rows[0]);
    extractedRows.push(rows[1]);

    let foundCount = 0;
    const keywords = ['특성화고', '특성화 고등학교', '전문계고', '직업계고'];

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const eligibility = String(row[eligibleIdx] || '');
        const trackName = String(row[trackIdx] || '');
        
        const hasKeyword = keywords.some(kw => eligibility.includes(kw) || trackName.includes(kw));
        
        if (hasKeyword) {
            extractedRows.push(row);
            foundCount++;
        }
    }

    console.log(`추출 완료: 총 ${foundCount}개의 특성화고 지원 가능 학과(전형) 발견.`);

    // Write to new workbook
    console.log("새로운 엑셀 파일 생성 중...");
    const newWb = xlsx.utils.book_new();
    const newWs = xlsx.utils.aoa_to_sheet(extractedRows);
    
    xlsx.utils.book_append_sheet(newWb, newWs, "수시_특성화고");
    
    xlsx.writeFile(newWb, OUTPUT_FILE);
    console.log(`저장 완료: ${OUTPUT_FILE}`);
}

extractRealData().catch(e => {
    console.error("데이터 추출 중 오류 발생:", e);
});
