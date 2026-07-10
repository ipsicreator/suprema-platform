const xlsx = require('xlsx');
const path = require('path');

const inputExcel = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');

function extractPreview() {
    console.log("원본 데이터 로딩 중: " + inputExcel);
    const workbook = xlsx.readFile(inputExcel);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    const headers = rows[1];
    
    let univIdx = -1, typeIdx = -1, trackIdx = -1, eligibleIdx = -1, deptIdx = -1, quotaIdx = -1;
    headers.forEach((h, i) => {
        if(h === '대학교' || h === '대학') univIdx = i;
        if(h === '전형유형') typeIdx = i;
        if(h === '전형명') trackIdx = i;
        if(h === '지원자격') eligibleIdx = i;
        if(h === '모집단위명' || h === '모집단위') deptIdx = i;
        if(h === '모집인원') quotaIdx = i;
    });

    let foundCount = 0;
    console.log(`\n=== 실데이터 추출 프리뷰 (최초 5건만 출력) ===`);
    console.log(`형식: [대학명] | [전형명] | [모집단위명(실제학과)] | [모집인원(실제인원)]\n`);

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        const eligibility = String(row[eligibleIdx] || '');
        const track = String(row[trackIdx] || '');
        
        // 필터링: 지원자격 또는 전형명에 특성화고 명시
        if (eligibility.includes('특성화고') || track.includes('특성화고')) {
            const univ = row[univIdx];
            const dept = row[deptIdx];
            const quota = row[quotaIdx];
            
            console.log(`- ${univ} | ${track} | ${dept} | ${quota}명`);
            console.log(`  └ 지원자격 원문: "${eligibility.substring(0, 80)}..."\n`);
            
            foundCount++;
            if (foundCount >= 5) break;
        }
    }
}

extractPreview();
