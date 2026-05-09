const puppeteer = require('puppeteer');
(async()=>{
 const b=await puppeteer.launch({headless:true});
 const p=await b.newPage();
 await p.setViewport({width:1920,height:1080});
 await p.goto('http://127.0.0.1:5173',{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,1200));
 const txt=await p.evaluate(()=>document.body.innerText.slice(0,500));
 console.log(txt);
 await p.screenshot({path:'public/qa_captures/debug_now.png'});
 await b.close();
})();
