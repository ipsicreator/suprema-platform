const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.env.APPDATA, 'Antigravity', 'User', 'globalStorage', 'state.vscdb');
const backupPath = path.join(process.env.APPDATA, 'Antigravity', 'User', 'globalStorage', 'state.vscdb.backup');

console.log('--- UI Database Purge Started ---');

[dbPath, backupPath].forEach(p => {
    if (fs.existsSync(p)) {
        try {
            fs.unlinkSync(p);
            console.log(`Successfully deleted: ${p}`);
        } catch (e) {
            console.error(`Failed to delete ${p}: ${e.message}`);
        }
    } else {
        console.log(`File not found, skipping: ${p}`);
    }
});

console.log('--- UI Database Purge Finished ---');
