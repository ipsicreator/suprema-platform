const axios = require('axios');

axios.get('https://www.adiga.kr/ucp/uvt/uni/univDetailSelection.do?menuId=PCUVTINF2000&unvCd=0000050&searchSyr=2027')
.then(r => {
    const html = r.data;
    if (html.includes('고려대학교') || html.includes('고려대')) {
        console.log("Found 고려대학교 in HTML!");
        // Print the lines containing it
        const lines = html.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].includes('고려대')) {
                console.log(`Line ${i}:`, lines[i].trim());
            }
        }
    } else {
        console.log("고려대학교 not found in HTML.");
    }
})
.catch(console.error);
