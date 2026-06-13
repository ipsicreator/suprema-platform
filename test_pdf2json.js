const fs = require('fs');
const PDFParser = require('pdf2json');
const { calculateGPAFromText } = require('./lib/pdf-parser.ts');

const pdfParser = new PDFParser(this, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError) );
pdfParser.on("pdfParser_dataReady", pdfData => {
    const text = pdfParser.getRawTextContent();
    console.log("Text length:", text.length);
    fs.writeFileSync("scratch/pdf2json_text.txt", text, "utf8");
    console.log("Analysis:", JSON.stringify(calculateGPAFromText(text, '9-level'), null, 2));
});

pdfParser.loadPDF("서다현_학생부.pdf");
