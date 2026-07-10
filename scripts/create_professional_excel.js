const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

const TEMPLATE_PATH = path.join(__dirname, '..', 'data', '2027학년도_수시전형_최종_교정완료본.xlsx');
const RECORDS_PATH = path.join(__dirname, '..', 'scratch', 'parsed_records.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'data', '2027학년도_수시전형_특성화고_최종정리.xlsx');

// Helper to normalize university names for comparison (e.g. "건국대학교(글로컬)" -> "건국대")
function getShortUnivName(univ) {
    if (!univ) return "";
    let name = univ.replace(/대학교|대학/g, '').trim();
    name = name.replace(/\([^)]+\)/g, '').trim();
    return name;
}

async function main() {
    console.log("=== Generating Professional Excel Document via JOIN ===");
    
    // 1. Read Template/Local DB
    if (!fs.existsSync(TEMPLATE_PATH)) {
        console.error(`Local Excel DB not found at: ${TEMPLATE_PATH}`);
        process.exit(1);
    }
    const templateWorkbook = xlsx.readFile(TEMPLATE_PATH);
    const templateSheet = templateWorkbook.Sheets[templateWorkbook.SheetNames[0]];
    const rawRows = xlsx.utils.sheet_to_json(templateSheet, { header: 1, defval: '' });
    
    const indexRow = rawRows[0]; // Row 0
    const headerRow = rawRows[1]; // Row 1
    const excelRows = rawRows.slice(2);
    
    console.log(`Loaded ${excelRows.length} database rows from template.`);

    // 2. Read Parsed Targets from Adiga PDF
    if (!fs.existsSync(RECORDS_PATH)) {
        console.error(`Parsed records JSON not found at: ${RECORDS_PATH}`);
        process.exit(1);
    }
    const { susiRecords, jungsiRecords } = JSON.parse(fs.readFileSync(RECORDS_PATH, 'utf8'));
    console.log(`Loaded Adiga targets - Susi: ${susiRecords.length}, Jungsi: ${jungsiRecords.length}`);

    // Column Indices for matching
    const COL_UNIV = 2;
    const COL_TYPE = 5;
    const COL_NAME = 6;

    // 3. Relational JOIN to filter Kwangwoon and other universities by majors
    const matchedSusiRows = [];
    const matchedJungsiRows = [];

    // Pre-calculate target sets for optimization
    const susiTargets = susiRecords.filter(r => r.univ);
    const jungsiTargets = jungsiRecords.filter(r => r.univ);

    // Track matching metrics
    let matchedSusiCount = 0;
    let matchedJungsiCount = 0;

    // Process all local DB rows
    excelRows.forEach(row => {
        if (!row || row.length === 0) return;
        const localUniv = String(row[COL_UNIV] || '').trim();
        const localType = String(row[COL_TYPE] || '').trim();
        const localTrack = String(row[COL_NAME] || '').trim();

        if (!localUniv) return;

        const localUnivShort = getShortUnivName(localUniv);

        // Check if this row is Susi or Jungsi
        const isJungsiRow = localType.includes("정시") || localTrack.includes("정시") || localType.includes("수능") || localTrack.includes("수능");

        if (isJungsiRow) {
            // Match against Jungsi targets
            const hasMatch = jungsiTargets.some(target => {
                const targetUnivShort = getShortUnivName(target.univ);
                if (localUnivShort !== targetUnivShort) return false;

                const cleanLocalTrack = localTrack.replace(/\s+/g, '');
                const cleanTargetTrack = target.trackName.replace(/\s+/g, '');

                return (cleanLocalTrack.includes("특성화고") && cleanTargetTrack.includes("특성화고")) ||
                       cleanLocalTrack.includes(cleanTargetTrack) ||
                       cleanTargetTrack.includes(cleanLocalTrack);
            });

            if (hasMatch) {
                matchedJungsiRows.push(row);
                matchedJungsiCount++;
            }
        } else {
            // Match against Susi targets
            const hasMatch = susiTargets.some(target => {
                const targetUnivShort = getShortUnivName(target.univ);
                if (localUnivShort !== targetUnivShort) return false;

                const cleanLocalTrack = localTrack.replace(/\s+/g, '');
                const cleanTargetTrack = target.trackName.replace(/\s+/g, '');

                return (cleanLocalTrack.includes("특성화고") && cleanTargetTrack.includes("특성화고")) ||
                       cleanLocalTrack.includes(cleanTargetTrack) ||
                       cleanTargetTrack.includes(cleanLocalTrack);
            });

            if (hasMatch) {
                matchedSusiRows.push(row);
                matchedSusiCount++;
            }
        }
    });

    console.log(`JOIN Complete. Susi matched: ${matchedSusiRows.length} rows, Jungsi matched: ${matchedJungsiRows.length} rows.`);

    // 4. Create Workbook and Sheets
    const newWorkbook = xlsx.utils.book_new();
    
    const susiSheetRows = [indexRow, headerRow, ...matchedSusiRows];
    const susiSheet = xlsx.utils.aoa_to_sheet(susiSheetRows);
    xlsx.utils.book_append_sheet(newWorkbook, susiSheet, "수시");

    const jungsiSheetRows = [indexRow, headerRow, ...matchedJungsiRows];
    const jungsiSheet = xlsx.utils.aoa_to_sheet(jungsiSheetRows);
    xlsx.utils.book_append_sheet(newWorkbook, jungsiSheet, "정시");

    // 5. Save Workbook
    console.log(`Writing professional JOIN-ed excel to: ${OUTPUT_PATH}`);
    xlsx.writeFile(newWorkbook, OUTPUT_PATH);
    console.log("Excel file generated successfully via JOIN!");
}

main().catch(console.error);

