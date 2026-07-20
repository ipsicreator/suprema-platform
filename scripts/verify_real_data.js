const xlsx = require('xlsx');
const path = require('path');

const outputFile = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_지원가능대학.xlsx');

function verifyData() {
    const workbook = xlsx.readFile(outputFile);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    // header: 1 reads as arrays
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    if (rows.length < 2) {
        console.log("데이터가 없습니다.");
        return;
    }

    // 원본 데이터가 상단 2줄이 헤더이므로 인덱스 1이 진짜 44개 컬럼 항목명
    const headers = rows[1];
    const firstRow = rows[2];

    console.log(`\n총 컬럼 개수: ${headers.length}개 (44개 항목 유지 확인)`);
    console.log("\n=== [첫 번째 학과] 44개 전체 항목 매핑 결과 ===\n");
    console.log("| 번호 | 항목명(컬럼) | 추출된 실제 데이터 |");
    console.log("|---|---|---|");
    
    for (let i = 0; i < headers.length; i++) {
        let val = firstRow[i];
        if (val === undefined || val === null) val = "";
        // 짧게 줄이기
        val = String(val).replace(/\r\n|\n/g, ' ').substring(0, 100);
        console.log(`| ${i+1} | **${headers[i]}** | ${val} |`);
    }
}
verifyData();
