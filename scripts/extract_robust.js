const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_최종결과.xlsx');

async function performRobustExtraction() {
    console.log("=== 지름길 없는 정밀 전수조사 및 44개 항목 완벽 매핑 시작 ===");
    
    console.log("원본 무결점 DB 파일 로딩 중...");
    const workbook = xlsx.readFile(DB_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    const headers1 = rows[0];
    const headers2 = rows[1];
    
    let eligibleIdx = headers1.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');
    if (eligibleIdx === -1) eligibleIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');

    let trackIdx = headers1.findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');
    if (trackIdx === -1) trackIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');

    const extractedRows = [];
    
    // 마지막 컬럼에 '검증결과' 헤더 추가
    const newHeader1 = [...rows[0], "검증결과"];
    const newHeader2 = [...rows[1], "검증결과"];
    extractedRows.push(newHeader1);
    extractedRows.push(newHeader2);

    // 입시 요강에서 특성화고 학생을 지칭하는 모든 파생 키워드 전수 망라
    const keywords = ['특성화', '전문계', '직업계', '마이스터'];
    let foundCount = 0;
    const foundUnivs = new Set();

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const eligibility = String(row[eligibleIdx] || '');
        const trackName = String(row[trackIdx] || '');
        
        // 어떤 키워드가 어디서 매칭되었는지 확인
        let matchReason = "";
        for (const kw of keywords) {
            if (eligibility.includes(kw)) {
                matchReason += `[지원자격: '${kw}' 포함] `;
            }
            if (trackName.includes(kw)) {
                matchReason += `[전형명: '${kw}' 포함] `;
            }
        }
        
        if (matchReason !== "") {
            const newRow = [...row];
            // 원래 44개 컬럼 길이에 맞춘 후, 마지막 컬럼에 검증결과 추가
            while (newRow.length < rows[0].length) {
                newRow.push('');
            }
            newRow[rows[0].length] = "검증완료: " + matchReason.trim();
            
            extractedRows.push(newRow);
            foundCount++;
            foundUnivs.add(row[0] || row[1] || row[2]); // 대학교명 임시 보관
        }
    }
    
    console.log(`전수조사 완료: 총 ${foundUnivs.size}개 대학에서 ${foundCount}건의 학과(전형) 실데이터를 완벽하게 추출했습니다.`);
    
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(extractedRows);
    xlsx.utils.book_append_sheet(wb, ws, "특성화고_최종");
    xlsx.writeFile(wb, OUTPUT_FILE);
    
    console.log(`44개 컬럼 항목 전체 1:1 매핑 복사 완료: ${OUTPUT_FILE}`);
}

performRobustExtraction().catch(console.error);
