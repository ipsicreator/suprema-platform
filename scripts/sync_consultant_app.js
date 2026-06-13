const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const consultantRoot = 'C:/Users/chris/Desktop/새 폴더/suprima_교과세특/consultant_app_independent';

const syncTargets = [
  ['lib/utils/admission/admissionLines.ts', 'src/utils/admission/admissionLines.ts'],
  ['lib/utils/admission/admissionDiagnosis.ts', 'src/utils/admission/admissionDiagnosis.ts'],
  ['data/admission/admissionData.json', 'src/data/admission/admissionData.json'],
  ['app/components/admission/charts/AdmissionTierChart.tsx', 'src/components/admission/charts/AdmissionTierChart.tsx'],
];

for (const [sourceRelative, destinationRelative] of syncTargets) {
  const sourcePath = path.join(rootDir, sourceRelative);
  const destinationPath = path.join(consultantRoot, destinationRelative);
  if (!fs.existsSync(sourcePath)) {
    console.error(`[sync] missing source: ${sourcePath}`);
    process.exitCode = 1;
    continue;
  }
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);
  if (destinationRelative.endsWith('AdmissionTierChart.tsx')) {
    const chartContent = fs.readFileSync(destinationPath, 'utf8')
      .replace("../../../../lib/utils/admission/admissionLines", "../../../utils/admission/admissionLines");
    fs.writeFileSync(destinationPath, chartContent, 'utf8');
  }
  console.log(`[sync] copied ${sourceRelative} -> ${destinationRelative}`);
}
