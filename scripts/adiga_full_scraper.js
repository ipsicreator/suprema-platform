const axios = require('axios');
const cheerio = require('cheerio');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');

const OUTPUT_FILE = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_지원가능대학_크롤링결과.xlsx');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeAdiga() {
    console.log("=== 대학어디가(adiga.kr) 직접 크롤링 시작 (지름길 없음) ===");
    const results = [];

    // 196+ universities, we loop through unvCd from 1 to 250
    for (let i = 1; i <= 250; i++) {
        let unvCd = i.toString().padStart(7, '0');
        let url = `https://www.adiga.kr/ucp/uvt/uni/univDetailSelection.do?menuId=PCUVTINF2000&unvCd=${unvCd}&searchSyr=2027`;

        try {
            const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 5000 });
            const html = res.data;

            if (!html || !html.includes('모집인원')) continue;

            // Check if vocational HS is mentioned anywhere in the page
            if (html.includes('특성화고') || html.includes('전문계고') || html.includes('직업계고')) {
                const $ = cheerio.load(html);
                const univName = $('h3.univ_name').text().trim() || `대학코드(${unvCd})`;

                // Parse tables in the HTML
                $('tr').each((idx, el) => {
                    const rowText = $(el).text().replace(/\s+/g, ' ');
                    if (rowText.includes('특성화고') || rowText.includes('전문계고') || rowText.includes('직업계고')) {
                        // Extract all columns in this row
                        const cols = [];
                        $(el).find('td, th').each((i, td) => {
                            cols.push($(td).text().trim());
                        });

                        if (cols.length > 0) {
                            results.push({
                                '대학교': univName,
                                '추출된행내용': cols.join(' | ')
                            });
                        }
                    }
                });

                console.log(`[크롤링 완료] ${univName} (코드: ${unvCd})`);
            }
            // Be gentle to the server
            await delay(50);
        } catch (e) {
            // silent catch for 404s/timeouts
        }
    }

    // Extract unique university names
    const uniqueUnivs = [...new Set(results.map(r => r['대학교']))];
    console.log(`총 ${uniqueUnivs.length}개 대학, ${results.length}개의 실제 행(데이터)을 찾았습니다.`);

    // Save the unique universities to a JSON file for the Cross-Join step
    const jsonPath = path.join(__dirname, '..', 'data', 'adiga_universities.json');
    fs.writeFileSync(jsonPath, JSON.stringify(uniqueUnivs, null, 2), 'utf-8');
    console.log(`타겟 대학 리스트 JSON 저장 성공: ${jsonPath}`);

    if (results.length > 0) {
        const wb = xlsx.utils.book_new();
        const ws = xlsx.utils.json_to_sheet(results);
        xlsx.utils.book_append_sheet(wb, ws, "크롤링결과");
        xlsx.writeFile(wb, OUTPUT_FILE);
        console.log(`크롤링 Raw 파일 저장 성공: ${OUTPUT_FILE}`);
    }
}

scrapeAdiga().catch(console.error);
