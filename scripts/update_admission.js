const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// 1. 엑셀 파일이 위치한 폴더
const EXCEL_DIR = 'C:/Users/chris/Desktop/새 폴더/suprima_교과세특/consultant_app_independent/public/';

// 2. 저장할 두 가지 프로젝트의 JSON 경로
const TARGET_CONSULTANT = 'C:/Users/chris/Desktop/새 폴더/suprima_교과세특/consultant_app_independent/src/data/admissionData.json';
const TARGET_PLATFORM = 'C:/Users/chris/Desktop/suprema-platform/data/admissionData.json';

console.log('엑셀 파일을 찾고 있습니다...');

const files = fs.readdirSync(EXCEL_DIR);
// .xlsx 확장자이면서 백업이나 임시파일(~$)이 아닌 파일 찾기
const excelFile = files.find(f => f.endsWith('.xlsx') && !f.startsWith('~$'));

if (!excelFile) {
    console.error('오류: public 폴더에 엑셀 파일(.xlsx)이 없습니다!');
    process.exit(1);
}

const excelPath = path.join(EXCEL_DIR, excelFile);
console.log(`발견된 엑셀 파일: ${excelFile}`);
console.log('엑셀 데이터를 읽는 중 (시간이 조금 걸릴 수 있습니다)...');

// 엑셀 파싱
const wb = xlsx.readFile(excelPath);
const sheetName = wb.SheetNames[0]; // 첫 번째 시트 사용
const sheet = wb.Sheets[sheetName];

// 엑셀 -> JSON 변환
const rawData = xlsx.utils.sheet_to_json(sheet);

console.log(`총 ${rawData.length}개의 데이터를 성공적으로 읽었습니다.`);
console.log('앱에 맞게 데이터 포맷을 변환 중입니다...');

// JSON 구조 매핑
const mappedData = rawData.map(row => {
    // 줄바꿈이 있는 헤더를 대응하기 위한 함수
    const findValue = (possibleKeys) => {
        for (const key of possibleKeys) {
            if (row[key] !== undefined) return row[key];
        }
        return null;
    };

    // 입결 숫자로 변환 (숫자가 아닌 텍스트는 null 또는 필터링)
    const parseGrade = (val) => {
        if (!val) return null;
        if (typeof val === 'number') return val;
        const num = parseFloat(String(val).replace(/[^0-9.]/g, ''));
        return isNaN(num) ? null : num;
    };

    return {
        region: findValue(['광역']),
        subRegion: findValue(['기초']),
        univ: findValue(['대학교']),
        track: findValue(['계열']),
        dept: findValue(['모집단위명', '모집단위']),
        type: findValue(['전형유형']),
        name: findValue(['전형명']),
        req: findValue(['최저학력기준']),
        method: findValue(['전형방법']),
        cutoff26: parseGrade(findValue(['2026학년도\r\n입결(등급)', '2026학년도 입결(등급)', '2026학년도 입결'])),
        cutoff25: parseGrade(findValue(['2025학년도\r\n입결(등급)', '2025학년도 입결(등급)', '2025학년도 입결'])),
        competition: findValue(['2026학년도\r\n경쟁률', '2026학년도 경쟁률'])
    };
});

// JSON 문자열 변환
const jsonOutput = JSON.stringify(mappedData, null, 2);

console.log('\n변환 완료! 두 프로젝트에 모두 업데이트를 시작합니다.');

try {
    fs.writeFileSync(TARGET_CONSULTANT, jsonOutput, 'utf8');
    console.log('✅ 컨설턴트 앱 업데이트 성공: ' + TARGET_CONSULTANT);
} catch (e) {
    console.error('❌ 컨설턴트 앱 업데이트 실패:', e.message);
}

try {
    // suprema-platform/data 폴더가 없을 수도 있으니 확인 후 생성
    const platformDir = path.dirname(TARGET_PLATFORM);
    if (!fs.existsSync(platformDir)) {
        fs.mkdirSync(platformDir, { recursive: true });
    }
    fs.writeFileSync(TARGET_PLATFORM, jsonOutput, 'utf8');
    console.log('✅ 수프리마 플랫폼 앱 업데이트 성공: ' + TARGET_PLATFORM);
} catch (e) {
    console.error('❌ 수프리마 플랫폼 앱 업데이트 실패:', e.message);
}

console.log('\n모든 업데이트가 완료되었습니다!');
console.log('이제 각 앱(저장소)에서 npm run dev 로 확인 후, Git 푸시(배포) 하시면 반영됩니다.');
