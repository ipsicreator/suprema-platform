const fs = require('fs');

const textFile = 'c:/Users/chris/Desktop/suprema-platform/scratch/adiga_3_text.txt';

function parseTable() {
    const text = fs.readFileSync(textFile, 'utf-8');
    const lines = text.split('\n');

    let mode = 'none'; // 'susi' or 'jungsi'
    const results = { susi: [], jungsi: [] };
    
    let currentRegion = '';

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line) continue;

        if (line.includes('3) 수시모집')) {
            mode = 'susi';
            continue;
        } else if (line.includes('4) 정시모집')) {
            mode = 'jungsi';
            continue;
        }

        if (mode === 'none') continue;

        // Skip headers
        if (line.includes('지역\t대학') || line.includes('전형방법') || line.includes('전형유형') || line.includes('모집군')) {
            continue;
        }

        // Region lines are usually just 2-3 characters (e.g., "서울", "인천", "경기")
        if (/^[가-힣]{2,3}$/.test(line) && !line.includes('대')) {
            currentRegion = line;
            continue;
        }

        // Parsing logic for a row:
        // Ex: "건국대 \t종합 \t특성화고교졸업자 \t22 \t서류70+학생부30"
        // Or sometimes it spans multiple lines.
        // Let's look for university name (ends with '대') at the start
        if (/^[가-힣]+대(\([가-힣]+\))?(\s|\t)/.test(line)) {
            // It's a start of a row
            let parts = line.split('\t').map(p => p.trim());
            // It might be split by spaces if tabs are missing
            if (parts.length < 3) {
                parts = line.split(/\s+/);
            }
            
            if (parts.length >= 4) {
                let univ = parts[0];
                let type = parts[1];
                let name = parts[2];
                let quota = parts[3];
                
                // Sometimes name spans multiple lines, or quota is pushed
                // Ex: "덕성여대 \t종합 기회균형Ⅰ"
                // "(특성화고교) 3 \t서류100"
                
                if (mode === 'susi') {
                    results.susi.push({ region: currentRegion, univ, type, name, quota });
                } else {
                    results.jungsi.push({ region: currentRegion, univ, type, name, quota });
                }
            } else {
                // handle multi-line parsing if needed
                // console.log("Partial line:", line);
            }
        }
    }

    console.log(`Parsed Susi rows: ${results.susi.length}`);
    console.log(`Parsed Jungsi rows: ${results.jungsi.length}`);
    return results;
}

parseTable();
