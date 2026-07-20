const axios = require('axios');
const cheerio = require('cheerio');

axios.get('https://www.adiga.kr/ucp/uvt/uni/univDetailSelection.do?menuId=PCUVTINF2000&unvCd=0000050&searchSyr=2027')
.then(r => {
    const $ = cheerio.load(r.data);
    console.log("Title:", $('title').text());
    console.log("h1:", $('h1').text().trim());
    console.log("h2:", $('h2').text().trim());
    console.log("h3:", $('h3').text().trim());
    console.log("h4:", $('h4').text().trim());
    console.log("div.univ_name:", $('div.univ_name').text().trim());
    console.log("p.univ_name:", $('p.univ_name').text().trim());
})
.catch(console.error);
