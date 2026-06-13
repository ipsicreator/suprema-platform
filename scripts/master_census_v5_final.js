const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

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
    "전형방법": base.method || "서류100",
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
    let lastDept = "";

    if (univ.includes("서울대")) {
        lines.forEach(line => {
            const match = line.match(/^([가-힣·& ]+)\s*([\d·]+)\s*([\d·]+)\s*([\d·]+)/);
            if (match && !line.includes('합계') && !line.includes('소계') && !line.includes('PAGE') && match[1].trim().length > 1) {
                let dept = match[1].trim();
                const regional = match[2].replace(/·/g, '0');
                const general = match[3].replace(/·/g, '0');
                
                if (parseInt(regional) > 0) univData.push(common_cols({
                    univ, dept, track: "지역균형", quota: regional, 
                    method: "1단계:서류100(3배수)->2단계:1단계70+면접30", min: "미적용", qual: "졸업예정자(추천)"
                }));
                if (parseInt(general) > 0) univData.push(common_cols({
                    univ, dept, track: "일반전형", quota: general, 
                    method: "1단계:서류100(2배수)->2단계:1단계50+면접50", min: "미적용"
                }));
            }
        });
    } else if (univ.includes("연세대")) {
        lines.forEach(line => {
            const match = line.match(/^([가-힣·& ]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)/);
            if (match && !line.includes('합계') && !line.includes('소계') && match[1].trim().length > 1) {
                const dept = match[1].trim();
                const q = match.slice(2).map(v => parseInt(v.replace(/·/g, '0')) || 0);
                const tracks = ["추천형", "종합인재형", "탐구인재형", "기회균형", "논술전형"];
                const methods = ["1단계:교과100(5배수)->2단계:교과80+서류20", "1단계:서류100(4배수)->2단계:서류70+면접30", "1단계:서류100->2단계:서류60+면접40", "서류100", "논술100"];
                const mins = ["적용", "적용", "미적용", "미적용", "적용"];
                
                q.forEach((num, i) => {
                    if (num > 0 && i < tracks.length) {
                        univData.push(common_cols({
                            univ, dept, track: tracks[i], quota: num, method: methods[i], min: mins[i]
                        }));
                    }
                });
            }
        });
    } else {
        let currentTrack = "일반전형";
        lines.forEach(line => {
            if (line.includes('학생부교과') || line.includes('추천형') || line.includes('지역균형')) currentTrack = "학생부교과(추천)";
            else if (line.includes('학생부종합')) currentTrack = "학생부종합";
            else if (line.includes('논술')) currentTrack = "논술전형";

            // Improved regex for dept + quota
            const match = line.match(/([가-힣·& ]{2,20})[\s|]+(\d{1,3})/);
            if (match) {
                let dept = match[1].trim();
                const quota = parseInt(match[2]);
                
                // Filter out noise
                if (['모집', '인원', '합계', '소계', '전형', '서류', '면접', '실기'].includes(dept)) return;
                
                if (quota > 0 && !line.includes('PAGE') && !line.includes('2028')) {
                    univData.push(common_cols({
                        univ, dept, track: currentTrack, quota, 
                        method: currentTrack === "학생부교과(추천)" ? "교과100" : "서류100",
                        min: currentTrack === "논술전형" ? "적용" : "미적용"
                    }));
                }
            }
        });
    }

    if (univData.length > 0) {
        masterData.push(...univData);
        console.log(`[추출성공] ${univ}: ${univData.length}개 행`);
    }
});

const finalWb = XLSX.utils.book_new();
const finalWs = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(finalWb, finalWs, "Data");
XLSX.writeFile(finalWb, path.join(outputDir, "2028_수시_통합데이터셋_최종_전수검토본_수정.xlsx"));
console.log(`\n완료: 총 ${masterData.length}개 행`);
