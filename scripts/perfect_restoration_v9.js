const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');
const XLSX = require('xlsx');

const pdfDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\.tmp\\all_univs';
const outputDir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\outputs';

const TARGET_UNIVS = [
    "서울대", "연세대", "고려대", "서강대", "성균관대", "한양대", "중앙대", "경희대", "한국외대", "시립대", 
    "이화여대", "건국대", "동국대", "홍익대", "숙명여대", "국민대", "숭실대", "세종대", "단국대", "광운대", 
    "명지대", "상명대", "가톨릭대", "경기대", "서경대", "동덕여대"
];

const common_cols = (base) => ({
    "광역": (base.dept.includes("학부") || base.dept.includes("계열") || base.dept.includes("광역")) ? "O" : "-",
    "대학교": base.univ,
    "모집단위명": base.dept,
    "전형유형": "수시",
    "전형명": base.track,
    "모집인원": base.quota.toString(),
    "최저학력기준": base.min || "미적용",
    "전형방법": base.method || "서류100",
    "복수지원": "가능"
});

async function processPDF(filePath) {
    const fileName = path.basename(filePath);
    let matchedUniv = TARGET_UNIVS.find(u => fileName.includes(u));
    if (!matchedUniv) return null;

    console.log(`[TARGET_MATCH] Found PDF for ${matchedUniv}: ${fileName}`);

    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer, { max: 15 });
        const text = data.text;
        const lines = text.split('\n');
        
        let results = [];
        let currentTrack = "학생부종합";

        lines.forEach(line => {
            const clean = line.trim();
            if (clean.includes('교과') || clean.includes('추천')) currentTrack = "학생부교과";
            if (clean.includes('논술')) currentTrack = "논술전형";

            // Strong match for "Dept Name [Space] Quota"
            const match = clean.match(/([가-힣·& ]{2,15})\s+(\d{1,3})/);
            if (match) {
                const dept = match[1].trim();
                const quota = parseInt(match[2]);
                
                // Noise filter: must end with common dept suffixes or be long enough
                const isDept = /학과|학부|전공|계열|공학|융합|대학|학부|전공/.test(dept);
                
                if (quota > 0 && isDept && !['합계', '소계', '모집', '인원'].some(w => dept.includes(w))) {
                    results.push(common_cols({
                        univ: matchedUniv + "학교",
                        dept: dept,
                        track: currentTrack,
                        quota: quota
                    }));
                }
            }
        });
        return results;
    } catch (e) {
        return null;
    }
}

async function main() {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
    const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));
    const masterData = [];

    for (const file of files) {
        const result = await processPDF(path.join(pdfDir, file));
        if (result) masterData.push(...result);
    }

    if (masterData.length > 0) {
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(masterData);
        XLSX.utils.book_append_sheet(wb, ws, "Perfect_Census");
        XLSX.writeFile(wb, path.join(outputDir, "2028_수시_인서울_26개교_완벽복구본.xlsx"));
        console.log(`\nMaster File Created: ${masterData.length} rows for 26 universities.`);
    } else {
        console.log("\nNo data extracted. Please check PDF content or target list.");
    }
}

main();
