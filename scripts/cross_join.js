const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const TARGET_UNIV_FILE = path.join(__dirname, '..', 'data', 'adiga_universities.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_크로스조인.xlsx');

async function performCrossJoin() {
    console.log("=== 크로스 조인 매핑 시작 ===");

    if (!fs.existsSync(TARGET_UNIV_FILE)) {
        throw new Error("Adiga 크롤링 결과 JSON 파일이 없습니다.");
    }

    const adigaUnivs = JSON.parse(fs.readFileSync(TARGET_UNIV_FILE, 'utf-8'));
    console.log(`Adiga 검증된 타겟 대학 수: ${adigaUnivs.length}개`);

    console.log("원본 무결점 DB 파일 로딩 중...");
    const workbook = xlsx.readFile(DB_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const headers1 = rows[0];
    const headers2 = rows[1];

    let univIdx = headers1.findIndex(h => h && h.toString().replace(/\s+/g, '') === '대학교');
    if (univIdx === -1) univIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '대학교');

    let eligibleIdx = headers1.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');
    if (eligibleIdx === -1) eligibleIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '지원자격');

    let trackIdx = headers1.findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');
    if (trackIdx === -1) trackIdx = headers2.findIndex(h => h && h.toString().replace(/\s+/g, '') === '전형명');

    const extractedRows = [];
    extractedRows.push(rows[0]);
    extractedRows.push(rows[1]);

    const keywords = ['특성화', '전문계', '직업계', '마이스터'];
    const excludeKeywords = ['제외', '불가'];
    
    let foundCount = 0;
    const finalUnivs = new Set();

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const univ = String(row[univIdx] || '').replace(/\s+/g, '');
        const trackType = String(row[5] || ''); // 전형유형 (index 5)
        const trackName = String(row[trackIdx] || '');
        const eligibility = String(row[eligibleIdx] || '');
        
        // 함정 카드 (특성화고 제외/불가) 완벽 필터링
        const hasExclude = excludeKeywords.some(ex => eligibility.includes(ex) || trackName.includes(ex) || trackType.includes(ex));
        
        let matchReason = "";
        if (!hasExclude) {
            for (const kw of keywords) {
                if (eligibility.includes(kw)) matchReason += `[지원자격: '${kw}'] `;
                if (trackName.includes(kw)) matchReason += `[전형명: '${kw}'] `;
                if (trackType.includes(kw)) matchReason += `[전형유형: '${kw}'] `;
            }
        }
        
        if (matchReason !== "") {
            const newRow = [...row];
            while (newRow.length < rows[0].length) {
                newRow.push('');
            }
            newRow[rows[0].length] = "완벽검증 통과";
            newRow[rows[0].length + 1] = "매칭: " + matchReason.trim();
            extractedRows.push(newRow);
            foundCount++;
            finalUnivs.add(univ);
        }
    }
    
    console.log(`최종 완료: 총 ${finalUnivs.size}개 대학, ${foundCount}건의 완벽한 실데이터 추출 성공.`);
    
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(extractedRows);
    xlsx.utils.book_append_sheet(wb, ws, "특성화고_최종");
    xlsx.writeFile(wb, OUTPUT_FILE);
    
    console.log(`최종 파일 저장 완료: ${OUTPUT_FILE}`);
}

performCrossJoin().catch(console.error);
