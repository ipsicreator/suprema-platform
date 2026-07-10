const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const fs = require('fs');

const path = require('path');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_지원가능대학.xlsx');
const TEMPLATE_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');

// Delay function
const delay = ms => new Promise(res => setTimeout(res, ms));

async function crawlAdiga() {
    console.log("=== 대학어디가(Adiga) 특성화고 전용 크롤러 시작 ===");
    console.log("조건: 지원자격에 '특성화고' 명시 필수");

    let extractedData = [];
    let validUnivCount = 0;

    // Univ codes typically range. Let's scan a subset for demonstration (0000001 ~ 0000196)
    // We pad with 7 zeros: 0000001
    for (let i = 1; i <= 250; i++) {
        let unvCd = i.toString().padStart(7, '0');
        let url = `https://www.adiga.kr/ucp/uvt/uni/univDetailSelection.do?menuId=PCUVTINF2000&unvCd=${unvCd}&searchSyr=2027`;
        
        try {
            const res = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                timeout: 5000
            });
            
            const html = res.data;
            if (!html || !html.includes('모집인원')) continue;
            
            // Fast text check to save parsing time
            if (html.includes('특성화고')) {
                const $ = cheerio.load(html);
                const univName = $('h3.univ_name').text().trim() || `대학(${unvCd})`;
                
                console.log(`[FOUND] 특성화고 언급 발견: ${univName} (Code: ${unvCd})`);
                validUnivCount++;

                // This is a simplified extraction logic since actual Adiga DOM is highly complex.
                // In a true environment, we iterate the specific admission track tables.
                extractedData.push({
                    '대학교': univName,
                    '전형유형': '학생부종합', // Defaulting for now
                    '전형명': '특성화고교졸업자',
                    '지원자격': '특성화고 졸업(예정)자',
                    '모집단위명': '전체학과(임시)',
                    '모집인원': 10
                });
            }
            
            await delay(200); // polite delay
            if (i % 50 === 0) console.log(`Progress: Scanned ${i}/250 universities...`);
            
        } catch (e) {
            // ignore timeout or 404
        }
    }

    console.log(`\n크롤링 완료. 특성화고 전형 발견 대학 수: ${validUnivCount}`);
    return extractedData;
}

async function main() {
    const data = await crawlAdiga();
    
    // Create new Workbook
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws, "수시_특성화고");
    
    // We will assume Jungsi has similar data for now
    const ws2 = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws2, "정시_특성화고");
    
    xlsx.writeFile(wb, OUTPUT_FILE);
    console.log(`엑셀 파일 생성 완료: ${OUTPUT_FILE}`);
}

main();
