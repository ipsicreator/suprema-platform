const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const sourceDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs\\unified_sources';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

const common_cols = (base) => ({
    "광역": base.isBroad ? "O" : "-",
    "기초": "-",
    "대학교": base.univ,
    "계열": base.category || "통합",
    "모집단위명": base.dept,
    "전형유형": "수시",
    "전형명": base.track,
    "지원자격": base.qual || "고졸(예정)자",
    "모집인원": base.quota.toString(),
    "전년대비": "유지",
    "전년대비 변경사항": "-",
    "최저학력기준": base.min || "미적용",
    "전형방법": base.method || "서류100",
    "필요서류": "학교생활기록부",
    "복수지원": "가능",
    "학년별반영비율": "통합",
    "반영과목": "전교과",
    "진로선택과목": "반영"
});

const masterData = [];

const files = fs.readdirSync(sourceDir);

files.forEach(file => {
    const filePath = path.join(sourceDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const univNameMatch = lines[0].match(/#\s*([가-힣\?]+대학교)/);
    const univ = univNameMatch ? univNameMatch[1].replace(/\?/g, '') : "알수없음";
    
    let univData = [];

    // --- SNU Specific Logic ---
    if (univ.includes("서울대")) {
        // SNU has fixed tracks: 지역균형, 일반전형
        lines.forEach(line => {
            const match = line.match(/^(\d+):\s+([가-힣·& ]+)\s+(\d+)\s+(\d+)/); // Custom line format if viewed via tool, but here it's raw
            // Using raw line match
            const rawMatch = line.match(/^([가-힣·& ]+)\s+(\d+)\s+(\d+)/);
            if (rawMatch && !line.includes('PAGE') && !line.includes('서울대')) {
                const dept = rawMatch[1].trim();
                const regional = parseInt(rawMatch[2]);
                const general = parseInt(rawMatch[3]);
                
                if (regional > 0) univData.push(common_cols({
                    univ, dept, track: "지역균형", quota: regional, 
                    method: "1단계:서류100(3배수)->2단계:1단계70+면접30", min: "미적용", qual: "졸업예정자(추천)"
                }));
                if (general > 0) univData.push(common_cols({
                    univ, dept, track: "일반전형", quota: general, 
                    method: "1단계:서류100(2배수)->2단계:1단계50+면접50", min: "미적용"
                }));
            }
        });
    } 
    // --- Yonsei Specific Logic ---
    else if (univ.includes("연세대")) {
        // Yonsei tracks: 추천형, 종합인재, 탐구인재, 논술
        lines.forEach(line => {
            const rawMatch = line.match(/^([가-힣·& ]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/);
            if (rawMatch) {
                const dept = rawMatch[1].trim();
                const q = rawMatch.slice(2).map(v => parseInt(v));
                const tracks = ["추천형", "종합인재형", "탐구인재형", "기회균형", "논술전형"];
                const methods = ["교과100(5배수)->교과80+서류20", "서류100(4배수)->서류70+면접30", "서류100->서류60+면접40", "서류100", "논술100"];
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
    }
    // --- General Heuristic for Others ---
    else {
        let currentTrack = "일반전형";
        let currentMethod = "서류100";
        let currentMin = "미적용";

        lines.forEach(line => {
            // Track detection
            if (line.includes('학생부교과') || line.includes('추천형') || line.includes('지역균형')) {
                currentTrack = "학생부교과(추천)";
                currentMethod = "교과100";
                currentMin = "적용";
            } else if (line.includes('학생부종합')) {
                currentTrack = "학생부종합";
                currentMethod = "서류100";
                currentMin = "미적용";
            } else if (line.includes('논술')) {
                currentTrack = "논술전형";
                currentMethod = "논술100";
                currentMin = "적용";
            }

            // Quota detection
            const match = line.match(/^([가-힣·& ]{2,15})\s+(\d{1,3})$/);
            if (match) {
                const dept = match[1].trim();
                const quota = parseInt(match[2]);
                if (quota > 0 && !dept.includes('합계')) {
                    univData.push(common_cols({
                        univ, dept, track: currentTrack, quota, method: currentMethod, min: currentMin
                    }));
                }
            }
        });
    }

    if (univData.length > 0) {
        masterData.push(...univData);
        console.log(`[정밀추출] ${univ}: ${univData.length}개 행`);
    }
});

// Create Excel
const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(masterData);
XLSX.utils.book_append_sheet(wb, ws, "통합데이터셋_최종");
XLSX.writeFile(wb, path.join(outputDir, "2028_수시_전국주요대학_통합데이터셋_V3_수정본.xlsx"));
console.log(`\n총 ${masterData.length}개 행의 데이터셋이 생성되었습니다.`);
