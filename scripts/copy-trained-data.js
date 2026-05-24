const fs = require('fs');
const path = require('path');

const files = ['kor.traineddata', 'eng.traineddata'];
const srcDir = path.resolve(__dirname, '..');
const destDir = path.resolve(__dirname, '../public');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

files.forEach(file => {
  const srcPath = path.join(srcDir, file);
  const destPath = path.join(destDir, file);

  if (fs.existsSync(srcPath)) {
    console.log(`Copying ${file} from root to public/...`);
    fs.copyFileSync(srcPath, destPath);
    console.log(`Successfully copied ${file} to public/${file}`);
  } else {
    console.warn(`Warning: Source file ${srcPath} not found.`);
  }
});
