const fs = require('fs');
const path = require('path');

const appData = process.env.APPDATA;
const geminiData = path.join(process.env.USERPROFILE, '.gemini', 'antigravity');

const targets = [
  path.join(appData, 'Antigravity', 'logs'),
  path.join(appData, 'Antigravity', 'Local Storage'),
  path.join(appData, 'Antigravity', 'Cache'),
  path.join(appData, 'Antigravity', 'Code Cache'),
  path.join(geminiData, 'conversations'),
  path.join(geminiData, 'brain')
];

function deleteFolderRecursive(folderPath) {
  if (fs.existsSync(folderPath)) {
    console.log(`Cleaning: ${folderPath}`);
    try {
      // Current session ID to preserve
      const currentSessionId = 'f190602a-7750-47ee-a310-7952f134c1b2';
      
      fs.readdirSync(folderPath).forEach((file) => {
        const curPath = path.join(folderPath, file);
        if (file.includes(currentSessionId)) {
          console.log(`Preserving current session: ${file}`);
          return;
        }
        
        if (fs.lstatSync(curPath).isDirectory()) {
          deleteFolderRecursive(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      
      // Don't delete the root target folders themselves to avoid locking issues, 
      // just clean their contents unless they are not current session related.
      if (!folderPath.includes(currentSessionId)) {
          try { fs.rmdirSync(folderPath); } catch(e) {}
      }
    } catch (e) {
      console.error(`Failed to clean ${folderPath}: ${e.message}`);
    }
  }
}

console.log('--- Suprema Deep Cleanup Started ---');
targets.forEach(deleteFolderRecursive);
console.log('--- Cleanup Finished ---');
