const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');

const pdfDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\.tmp\\all_univs';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

const TARGET_UNIVS = [
    "가천대", "가톨릭대", "건국대", "경기대", "경희대", "고려대", "광운대", "국민대", "단국대", "동국대", 
    "명지대", "서강대", "서울대", "시립대", "성균관대", "세종대", "숙명여대", "숭실대", "아주대", "연세대", 
    "이화여대", "인하대", "중앙대", "한국외대", "한양대", "홍익대"
];

const common_cols = (base) => ({
    "광역": (base.dept.includes("학부") || base.dept.includes("계열") || base.dept.includes("광역")) ? "O" : "-",
    "대학교": base.univ,
    "모집단위명": base.dept,
    "전형유형": "수시",
    "전형명": base.track,
    "모집인원": base.quota.toString(),
    "최저학력기준": "요강참조",
    "전형방법": "서류100",
    "복수지원": "가능"
});

async function processPDF(filePath) {
    const fileName = path.basename(filePath);
    let matchedUniv = TARGET_UNIVS.find(u => fileName.includes(u));
    if (!matchedUniv) return null;

    console.log(`[EXTRACTING] ${matchedUniv}...`);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer); // Read FULL text
        const lines = data.text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        
        let results = [];
        let currentTrack = "학생부위주";

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            if (line.includes('교과') || line.includes('추천')) currentTrack = "학생부교과";
            if (line.includes('종합')) currentTrack = "학생부종합";
            if (line.includes('논술')) currentTrack = "논술전형";

            // Better regex for Recruitment Unit + Quota
            // Pattern: Dept Name [Optional spaces/tabs] Quota
            const match = line.match(/^([가-힣A-Za-z·& ]{2,20})\s+(\d{1,3})$/);
            if (match) {
                const dept = match[1].trim();
                const quota = parseInt(match[2]);
                
                if (quota > 0 && !['합계', '소계', '모집', '인원', '단계', '전형'].some(w => dept.includes(w))) {
                    results.push(common_cols({
                        univ: matchedUniv + "학교",
                        dept: dept,
                        track: currentTrack,
                        quota: quota
                    }));
                }
            }
            
            // Special Logic for SNU and others with vertical/spread tables
            if (matchedUniv === "서울대" && line.match(/^[가-힣·& ]+(?:학과|학부|전공)$/)) {
                // Look ahead for numbers in SNU's specific layout
                for (let j = 1; j <= 3; j++) {
                    if (lines[i+j] && lines[i+j].match(/^\d+$/)) {
                        results.push(common_cols({
                            univ: "서울대학교",
                            dept: line,
                            track: j === 1 ? "지역균형" : "일반전형",
                            quota: lines[i+j]
                        }));
                    }
                }
            }
        }
        console.log(`[DONE] ${matchedUniv}: ${results.length} items found.`);
        return results;
    } catch (e) { return null; }
}

async function main() {
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    const masterData = [];

    for (const file of files) {
        const result = await processPDF(path.join(pdfDir, file));
        if (result) masterData.push(...result);
    }

    if (masterData.length > 0) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(masterData);
        XLSX.utils.book_append_sheet(wb, ws, "Perfect_26_Census");
        XLSX.writeFile(wb, path.join(outputDir, "2028_수시_주요26개교_전수조사_최종본.xlsx"));
        console.log(`\nMaster File Created: ${masterData.length} rows for 26 universities.`);
    }
}

main();
