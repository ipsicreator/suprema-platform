const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

const common_cols = (base) => ({
    "광역": base.dept.includes("학부") || base.dept.includes("계열") || base.dept.includes("광역") ? "O" : "-",
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

    // --- UNIVERSITY SPECIFIC RULES ---
    if (univ.includes("서울대")) {
        lines.forEach(line => {
            // Match "Dept 12 22 2..." (Regional, General, Opportunity...)
            const match = line.match(/^([가-힣·& ]+)\s*([\d·]+)\s*([\d·]+)\s*([\d·]+)/);
            if (match && !line.includes('합계') && !line.includes('소계') && !line.includes('PAGE')) {
                const dept = match[1].trim();
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
            // Match "Dept 26 76 5..."
            const match = line.match(/^([가-힣·& ]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)\s+([\d·]+)/);
            if (match && !line.includes('합계') && !line.includes('소계')) {
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
    } else if (univ.includes("서강대")) {
        lines.forEach(line => {
            const match = line.match(/^([가-힣·& ]+)\s*(\d+)\s*(\d+)\s*(\d+)\s*(\d+)\s*(\d+)\s*(\d+)/);
            if (match && !line.includes('합계')) {
                const dept = match[1].trim();
                const q = match.slice(2).map(v => parseInt(v) || 0);
                const tracks = ["지역균형", "일반I", "일반II", "기회균형", "서강가치", "논술"];
                const methods = ["교과90+출결10", "서류100", "서류100", "서류100", "서류100", "논술80+교과10+출결10"];
                const mins = ["적용(3합7)", "미적용", "적용(3합7)", "미적용", "미적용", "적용(3합7)"];
                
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
        // --- GENERAL HEURISTIC (Improved) ---
        let contextTrack = "일반전형";
        lines.forEach(line => {
            if (line.includes('학생부교과') || line.includes('추천형')) contextTrack = "학생부교과";
            if (line.includes('학생부종합')) contextTrack = "학생부종합";
            if (line.includes('논술')) contextTrack = "논술전형";

            // Match "Dept Name 123" or "Dept Name | 123"
            const match = line.match(/([가-힣·& ]{2,20})[\s|]+(\d{1,3})/);
            if (match && !line.includes('PAGE') && !line.includes('2028')) {
                const dept = match[1].trim();
                const quota = parseInt(match[2]);
                if (quota > 0 && !dept.includes('소계') && !dept.includes('합계')) {
                    univData.push(common_cols({
                        univ, dept, track: contextTrack, quota, 
                        method: contextTrack === "학생부교과" ? "교과100" : "서류100",
                        min: contextTrack === "논술전형" ? "적용" : "미적용"
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

// Final XLSX
const finalWb = XLSX.utils.book_new();
const finalWs = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(finalWb, finalWs, "Data");
XLSX.writeFile(finalWb, path.join(outputDir, "2028_수시_통합데이터셋_최종_전수검토본.xlsx"));

console.log(`\n완료: 총 ${masterData.length}개 행 추출`);
