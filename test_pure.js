const fs = require('fs');
const pdf = require('pdf-parse');
const { calculateGPAFromText } = require('./lib/pdf-parser.ts');

const buffer = fs.readFileSync('서다현_학생부.pdf');
pdf(buffer).then(function(data) {
    const text = data.text;
    console.log("Extracted text length:", text.length);
    fs.writeFileSync("scratch/pdf_text.txt", text, "utf8");
    console.log("Analysis Result:", JSON.stringify(calculateGPAFromText(text, '9-level'), null, 2));
}).catch(function(error) {
    console.log("Error:", error);
});
