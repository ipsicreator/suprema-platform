const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PDFParser = require('pdf2json');
const xlsx = require('xlsx');

// Configuration - 정확히 명시해주신 공식 아카이브 링크 구조를 사용합니다.
// (참고: 실제 다운로드되는 고유 번호를 fileSeq 변수에 할당해 주시면 됩니다. 기본값으로 1을 세팅해 두었습니다.)
const FILE_SEQ = 1; 
const PDF_URL = `https://www.adiga.kr/uct/ces/fileDownload.do?prtlBbsId=26025&fileSeq=${FILE_SEQ}`;
const DATA_DIR = path.join(__dirname, '..', 'data');
const PDF_PATH = path.join(DATA_DIR, '2027_adiga_119.pdf');
const TEMPLATE_EXCEL_PATH = path.join(DATA_DIR, '2027학년도_수시전형_최종_교정완료본.xlsx');
const OUTPUT_EXCEL_PATH = path.join(DATA_DIR, '2027학년도_수시전형_특성화고_지원가능대학.xlsx');

async function downloadPDF() {
    console.log(`Downloading PDF from: ${PDF_URL}`);
    console.log(`목표 경로: ${PDF_PATH} (외부 디렉터리 접근 차단)`);
    
    const response = await axios({
        url: PDF_URL,
        method: 'GET',
        responseType: 'stream',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(PDF_PATH);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            reject(err);
        });
        writer.on('close', () => {
            if (!error) {
                console.log('Download complete.');
                resolve(true);
            }
        });
    });
}

function extractTextFromPDF2JSON(pdfData) {
    let text = '';
    if (pdfData && pdfData.Pages) {
        pdfData.Pages.forEach(page => {
            if (page.Texts) {
                page.Texts.forEach(t => {
                    if (t && t.R && t.R[0] && t.R[0].T) {
                        try {
                            text += decodeURIComponent(t.R[0].T) + ' ';
                        } catch (e) {
                            text += unescape(t.R[0].T) + ' ';
                        }
                    }
                });
                text += '\n';
            }
        });
    }
    return text;
}

async function extractData() {
    console.log(`Reading PDF: ${PDF_PATH}`);
    
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        
        pdfParser.on("pdfParser_dataError", errData => {
            console.error(errData.parserError);
            reject(errData.parserError);
        });
        
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const text = extractTextFromPDF2JSON(pdfData);
            console.log(`PDF parsed. Length: ${text.length} characters.`);

            const susiData = [];
            const jungsiData = [];
            const lines = text.split('\n');
            let currentUniv = '';
            let currentPeriod = '수시'; // default

            lines.forEach((line) => {
                line = line.trim();
                if (line.match(/^[가-힣]{2,10}대학교\b/)) {
                    currentUniv = line.split(' ')[0];
                } else if (line.includes('수시모집')) {
                    currentPeriod = '수시';
                } else if (line.includes('정시모집')) {
                    currentPeriod = '정시';
                }

                if (line.includes('특성화고')) {
                    const entry = {
                        '대학교': currentUniv,
                        '전형유형': currentPeriod === '수시' ? '학생부종합' : '수능위주',
                        '전형명': '특성화고교졸업자전형(추정)',
                        '지원자격': line.substring(0, 100),
                        '모집단위명': '전체(추정)',
                        '모집인원': ''
                    };
                    if (currentPeriod === '수시') {
                        susiData.push(entry);
                    } else {
                        jungsiData.push(entry);
                    }
                }
            });

            console.log(`Extracted Susi records: ${susiData.length}`);
            console.log(`Extracted Jungsi records: ${jungsiData.length}`);
            resolve({ susiData, jungsiData });
        });
        
        pdfParser.loadPDF(PDF_PATH);
    });
}

function saveToExcel(susiData, jungsiData) {
    console.log(`Reading template Excel: ${TEMPLATE_EXCEL_PATH}`);
    if (!fs.existsSync(TEMPLATE_EXCEL_PATH)) {
        throw new Error("Template Excel not found.");
    }
    const templateWorkbook = xlsx.readFile(TEMPLATE_EXCEL_PATH);
    const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];
    const headersRows = xlsx.utils.sheet_to_json(templateSheet, { header: 1, defval: '' });
    
    const indicesRow = headersRows[0];
    const headerRow = headersRows[1];

    const mapDataToRows = (data) => {
        return data.map(item => {
            const rowArr = new Array(headerRow.length).fill('');
            headerRow.forEach((colName, index) => {
                if (colName === '대학교' || colName === '대학') rowArr[index] = item['대학교'] || '';
                else if (colName === '전형유형') rowArr[index] = item['전형유형'] || '';
                else if (colName === '전형명') rowArr[index] = item['전형명'] || '';
                else if (colName === '지원자격') rowArr[index] = item['지원자격'] || '';
                else if (colName === '모집단위명' || colName === '모집단위') rowArr[index] = item['모집단위명'] || '';
                else if (colName === '모집인원') rowArr[index] = item['모집인원'] || '';
            });
            return rowArr;
        });
    };

    const newWorkbook = xlsx.utils.book_new();
    
    const susiRows = [indicesRow, headerRow, ...mapDataToRows(susiData)];
    const susiSheet = xlsx.utils.aoa_to_sheet(susiRows);
    xlsx.utils.book_append_sheet(newWorkbook, susiSheet, "수시");

    const jungsiRows = [indicesRow, headerRow, ...mapDataToRows(jungsiData)];
    const jungsiSheet = xlsx.utils.aoa_to_sheet(jungsiRows);
    xlsx.utils.book_append_sheet(newWorkbook, jungsiSheet, "정시");

    console.log(`Saving final Excel to: ${OUTPUT_EXCEL_PATH}`);
    xlsx.writeFile(newWorkbook, OUTPUT_EXCEL_PATH);
    console.log("Save complete!");
}

async function main() {
    try {
        console.log("=== Phase 1: Download ===");
        if (fs.existsSync(PDF_PATH)) {
            console.log("기존 PDF 삭제 중...");
            fs.unlinkSync(PDF_PATH);
        }
        await downloadPDF();

        console.log("\n=== Phase 2: Extract ===");
        const { susiData, jungsiData } = await extractData();

        console.log("\n=== Phase 3: Generate Excel ===");
        saveToExcel(susiData, jungsiData);

        console.log("\nAll tasks completed successfully.");
    } catch (e) {
        console.error("An error occurred during execution:", e);
    }
}

main();
