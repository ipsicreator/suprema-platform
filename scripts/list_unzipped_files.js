const fs = require('fs');
const path = require('path');

const dir = 'C:\\Users\\chris\\Desktop\\suprema-platform\\.tmp\\adiga_seoul_priority1_unzipped';
if (fs.existsSync(dir)) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        console.log(f);
    });
} else {
    console.log("Directory not found");
}
