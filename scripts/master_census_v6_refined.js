const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

// --- KEYWORDS TO IGNORE ---
const noiseKeywords = [
    '합계', '소계', '전형', '안내', '방법', '모집', '인원', '단계', '서류', '면접', '실기', 
    '발표', '홈페이지', '반영', '영역', '수능', '최저', '기준', '지원', '자격', '대상', 
    '제출', '서류', '학생부', '교과', '종합', '논술', '특별', '정원', '이내', '이상',
    '이하', '미달', '해당', '내역', '입학', '전공', '대학', '학부', '학과', '모집단위'
];

const isRealDept = (name) => {
    if (!name || name.length < 2) return false;
    if (name.length > 20) return false; // Dept names aren't that long usually
    if (noiseKeywords.some(k => name.includes(k) && name.length < 5)) return false; // "모집" (bad), "국어국문학과" (good)
    if (name.match(/^[가-힣]+$/)) {
        // Simple heuristic: departments usually end in 학과, 학부, 전공, 계열, 유닛, 학단
        if (name.endsWith('과') || name.endsWith('부') || name.endsWith('공') || name.endsWith('열') || name.endsWith('공학')) return true;
    }
    // Also catch names like "첨단융합학부"
    return name.length >= 2 && !noiseKeywords.includes(name);
};

const common_cols = (base) => ({
    "광역": (base.dept.includes("학부") || base.dept.includes("계열") || base.dept.includes("광역")) ? "O" : "-",
    "기초": "-",
    "대학교": base.univ,
    "계열": base.category || "통합",
    "모집단위명": base.dept,
    "전형유형": "수시",
    "전형명": base.track,
    "지원자격": base.qual || "고졸(예정)자",
    "모집인원": base.quota.toString(),
    "전년대비": "유지",
    "전년대비 변경사항": base.changes || "-",
    "최저학력기준": base.min || "미적용",
    "전형방법": base.method || "서류/교과/면접",
    "필요서류": "학교생활기록부",
    "복수지원": "가능",
    "학년별반영비율": "통합",
    "반영과목": "전교과",
    "진로선택과목": "반영"
});

const masterData = [];
const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('_Source.md'));

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const univ = file.replace('_Source.md', '');
    
    let univData = [];
    let lastPotentialDept = "";
    let currentTrack = "일반전형";
    let currentMethod = "서류100";
    let currentMin = "미적용";

    lines.forEach(line => {
        const trimmed = line.trim().replace(/^\d+:\s+/, ''); // Remove line numbers if present
        if (!trimmed) return;

        // Track updates
        if (trimmed.includes('학생부교과') || trimmed.includes('추천형') || trimmed.includes('지역균형')) {
            currentTrack = "학생부교과(추천)"; currentMethod = "교과100"; currentMin = "적용";
        } else if (trimmed.includes('학생부종합')) {
            currentTrack = "학생부종합"; currentMethod = "서류100"; currentMin = "미적용";
        } else if (trimmed.includes('논술')) {
            currentTrack = "논술전형"; currentMethod = "논술100"; currentMin = "적용";
        }

        // Search for quotas
        const quotaMatch = trimmed.match(/(\d{1,3})/g);
        const deptMatch = trimmed.match(/[가-힣]{2,10}(?:학과|학부|전공|계열|공학|대학)/);

        if (deptMatch) {
            lastPotentialDept = deptMatch[0];
        }

        if (quotaMatch && lastPotentialDept) {
            // If the line has numbers and we have a department name
            const quota = quotaMatch[0];
            if (parseInt(quota) > 1 && parseInt(quota) < 500) { // Reasonable quota range
                univData.push(common_cols({
                    univ, dept: lastPotentialDept, track: currentTrack, quota, 
                    method: currentMethod, min: currentMin
                }));
                // Prevent duplicate entries for the same name in the same block
                lastPotentialDept = ""; 
            }
        } else if (trimmed.length >= 2 && trimmed.length <= 15 && !trimmed.match(/\d/)) {
            // Line looks like a department name but no numbers
            if (isRealDept(trimmed)) {
                lastPotentialDept = trimmed;
            }
        }
    });

    if (univData.length > 0) {
        masterData.push(...univData);
        console.log(`[정밀완료] ${univ}: ${univData.length}개 행`);
    }
});

const finalWb = XLSX.utils.book_new();
const finalWs = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(finalWb, finalWs, "전수조사");
XLSX.writeFile(finalWb, path.join(outputDir, "2028_수시_통합데이터셋_최종_V6_정밀교정.xlsx"));
console.log(`\n총 ${masterData.length}개 행 완료.`);
