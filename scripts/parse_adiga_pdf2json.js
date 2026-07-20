const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf2json');
const xlsx = require('xlsx');

const TARGET_DIR = 'C:\\Users\\chris\\Desktop\\수시';

function findPdfPath() {
    if (!fs.existsSync(TARGET_DIR)) {
        throw new Error(`Directory not found: ${TARGET_DIR}`);
    }
    const files = fs.readdirSync(TARGET_DIR);
    const matchedFile = files.find(file => file.includes('2027학년도 특성화고교졸업자 특별전형.pdf'));
    if (!matchedFile) {
        throw new Error(`No file matching 2027학년도 특성화고교졸업자 특별전형.pdf found in ${TARGET_DIR}`);
    }
    return path.join(TARGET_DIR, matchedFile);
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
    const pdfPath = findPdfPath();
    console.log(`Reading PDF: ${pdfPath}`);
    
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1);
        
        pdfParser.on("pdfParser_dataError", errData => {
            console.error(errData.parserError);
            reject(errData.parserError);
        });
        
        pdfParser.on("pdfParser_dataReady", pdfData => {
            const text = extractTextFromPDF2JSON(pdfData);
            console.log(`PDF parsed. Length: ${text.length} characters.`);
            
            // Create scratch directory if it doesn't exist
            const scratchDir = path.join(__dirname, '..', 'scratch');
            if (!fs.existsSync(scratchDir)) {
                fs.mkdirSync(scratchDir, { recursive: true });
            }
            
            const outputPath = path.join(scratchDir, 'pdf_extracted_text.txt');
            fs.writeFileSync(outputPath, text, 'utf8');
            console.log(`Saved full text to ${outputPath}`);
            
            resolve(text);
        });
        
        pdfParser.loadPDF(pdfPath);
    });
}

extractData().catch(console.error);

