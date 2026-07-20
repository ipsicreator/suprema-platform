const xlsx = require('xlsx');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고특별전형_검색결과.xlsx');

function extract() {
    const workbook = xlsx.readFile(DB_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const trackIdx = 6; // 전형명
    const eligibleIdx = 7; // 지원자격

    const extractedRows = [];
    extractedRows.push(rows[0]);
    extractedRows.push(rows[1]);

    let count = 0;

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const trackName = String(row[trackIdx] || '');
        const req = String(row[eligibleIdx] || '');
        const type = String(row[5] || '');
        
        // 전형명에 아예 대놓고 '특성화', '전문계', '직업계', '마이스터'가 들어간 경우
        // 또는 지원자격에 특별전형이 명시된 경우만 "정확히" 뽑습니다.
        const isSpecialTrack = 
            trackName.includes('특성화') || 
            trackName.includes('전문계') || 
            trackName.includes('직업계') ||
            trackName.includes('마이스터') ||
            req.includes('특성화고특별전형') ||
            type.includes('특성화');
            
        if (isSpecialTrack) {
            extractedRows.push(row);
            count++;
        }
    }

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(extractedRows);
    xlsx.utils.book_append_sheet(wb, ws, "검색결과");
    xlsx.writeFile(wb, OUTPUT_FILE);
    
    console.log(`검색 완료: 총 ${count}개의 명시적 특성화고 특별전형 데이터가 추출되었습니다.`);
    console.log(`파일 저장 완료: ${OUTPUT_FILE}`);
}

extract();
