const xlsx = require('xlsx');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');

async function validate() {
    const workbook = xlsx.readFile(DB_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    const keywords = ['특성화', '전문계', '직업계', '마이스터'];
    const excludeKeywords = ['제외', '불가'];

    let totalMentionRows = 0;
    let excludedRows = 0;
    let finalValidRows = 0;
    
    // To see which columns actually contain the keyword
    let columnStats = {};

    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;
        
        const rowStr = row.join('|||');
        
        let hasKeyword = false;
        for (const kw of keywords) {
            if (rowStr.includes(kw)) {
                hasKeyword = true;
                break;
            }
        }
        
        if (hasKeyword) {
            totalMentionRows++;
            
            let hasExclude = false;
            for (const ex of excludeKeywords) {
                if (rowStr.includes(ex)) {
                    hasExclude = true;
                    break;
                }
            }
            
            if (hasExclude) {
                excludedRows++;
            } else {
                finalValidRows++;
            }
        }
    }

    console.log(`=== 궁극의 검증 리포트 ===`);
    console.log(`전체 DB 행 수: ${rows.length - 2}`);
    console.log(`'특성화' 등 관련 키워드가 단 한 번이라도 등장하는 행: ${totalMentionRows}건`);
    console.log(`그 중 '제외' 또는 '불가' 함정 키워드가 포함되어 버려진 행: ${excludedRows}건`);
    console.log(`모든 함정을 통과한 진짜 순수 특성화고 허용 행: ${finalValidRows}건`);
}

validate().catch(console.error);
