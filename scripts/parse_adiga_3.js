const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

const pdfPath = path.join(__dirname, '..', 'data', '2027_adiga_3.pdf');

async function run() {
    if (!fs.existsSync(pdfPath)) {
        console.log("File not found:", pdfPath);
        return;
    }
    const dataBuffer = fs.readFileSync(pdfPath);
    try {
        const data = await pdf(dataBuffer);
        console.log("Pages:", data.numpages);
        
        const lines = data.text.split('\n');
        const matched = [];
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('특성화고')) {
                // Get some context
                matched.push(lines.slice(Math.max(0, i-2), i+3).join('\n'));
            }
        }
        
        console.log(`Found ${matched.length} occurrences of '특성화고'.`);
        if (matched.length > 0) {
            console.log("Preview of first 3 occurrences:");
            for (let i = 0; i < Math.min(3, matched.length); i++) {
                console.log(`--- Match ${i+1} ---`);
                console.log(matched[i]);
            }
        }
    } catch (e) {
        console.error("Error parsing:", e);
    }
}
run();
