const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_최종결과.xlsx');

async function performSmartExtraction() {
    console.log("=== 지름길 없는 정밀 전수조사 (제외 조건 완벽 필터링) 시작 ===");
    
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
    
    const newHeader1 = [...rows[0], "검증결과"];
    const newHeader2 = [...rows[1], "검증결과"];
    extractedRows.push(newHeader1);
    extractedRows.push(newHeader2);

    const keywords = ['특성화', '전문계', '직업계', '마이스터'];
    // 특성화고를 명시적으로 제외하는 함정 키워드
    const excludeKeywords = ['제외', '불가', '안됨', '없음'];

    let foundCount = 0;
    const finalUnivs = new Set();

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const univ = String(row[0] || row[1] || row[2] || '');
        const eligibility = String(row[eligibleIdx] || '');
        const trackName = String(row[trackIdx] || '');
        
        // 함정 카드 (특성화고 제외) 필터링
        const hasExclude = excludeKeywords.some(ex => eligibility.includes(ex) || trackName.includes(ex));
        
        let matchReason = "";
        
        if (!hasExclude) {
            for (const kw of keywords) {
                if (eligibility.includes(kw)) matchReason += `[지원자격: '${kw}' 포함] `;
                if (trackName.includes(kw)) matchReason += `[전형명: '${kw}' 포함] `;
            }
        }
        
        if (matchReason !== "") {
            const newRow = [...row];
            while (newRow.length < rows[0].length) {
                newRow.push('');
            }
            newRow[rows[0].length] = "완벽검증: " + matchReason.trim();
            extractedRows.push(newRow);
            foundCount++;
            finalUnivs.add(univ);
        }
    }
    
    console.log(`최종 추출 완료: 총 ${finalUnivs.size}개 대학, ${foundCount}건의 진짜 특성화고 전형 데이터 추출`);
    
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(extractedRows);
    xlsx.utils.book_append_sheet(wb, ws, "특성화고_최종");
    xlsx.writeFile(wb, OUTPUT_FILE);
    console.log(`파일 저장 완료: ${OUTPUT_FILE}`);
}

performSmartExtraction().catch(console.error);
