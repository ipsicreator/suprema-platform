const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const consultantRoot = path.join('C:/Users/chris/Desktop', '새 폴더', 'suprima_교과세특', 'consultant_app_independent');

const syncTargets = [
  ['lib/utils/admission/admissionLines.ts', 'src/utils/admission/admissionLines.ts'],
  ['lib/utils/admission/admissionDiagnosis.ts', 'src/utils/admission/admissionDiagnosis.ts'],
  ['data/admission/admissionData.json', 'src/data/admission/admissionData.json'],
  ['app/components/admission/data/admissionData.ts', 'src/components/admission/data/admissionData.ts'],
  ['app/components/admission/data/index.ts', 'src/components/admission/data/index.ts'],
  ['app/components/admission/index.ts', 'src/components/admission/index.ts'],
  {
    source: 'app/components/admission/screens/PositionDiagnosis.tsx',
    destination: 'src/components/admission/screens/PositionDiagnosis.tsx',
    replacements: [
      ['../../../../lib/utils/admission/admissionLines', '../../../utils/admission/admissionLines'],
    ],
  },
  {
    source: 'app/components/admission/screens/EvaluationSimulation.tsx',
    destination: 'src/components/admission/screens/EvaluationSimulation.tsx',
    replacements: [
      ['../../../../lib/pocketbase', '../../../lib/pocketbase'],
      ['../../../../lib/utils/evaluationLogic', '../../../utils/evaluationLogic'],
      ['../../../../lib/utils/admission/admissionLines', '../../../utils/admission/admissionLines'],
      ['../charts/RadarEvaluationChart', '../../charts/RadarEvaluationChart'],
      ['../evaluation/RubricPanel', '../../evaluation/RubricPanel'],
      ['../evaluation/SepecViewer', '../../evaluation/SepecViewer'],
    ],
  },
  {
    source: 'app/components/admission/screens/index.ts',
    destination: 'src/components/admission/screens/index.ts',
  },
  {
    source: 'app/components/admission/charts/RadarEvaluationChart.tsx',
    destination: 'src/components/admission/charts/RadarEvaluationChart.tsx',
  },
  {
    source: 'app/components/admission/charts/AdmissionTierChart.tsx',
    destination: 'src/components/admission/charts/AdmissionTierChart.tsx',
    replacements: [
      ['../../../../lib/utils/admission/admissionLines', '../../../utils/admission/admissionLines'],
    ],
  },
  {
    source: 'app/components/admission/evaluation/RubricPanel.tsx',
    destination: 'src/components/admission/evaluation/RubricPanel.tsx',
  },
  {
    source: 'app/components/admission/evaluation/SepecViewer.tsx',
    destination: 'src/components/admission/evaluation/SepecViewer.tsx',
  },
];

for (const target of syncTargets) {
  const sourceRelative = Array.isArray(target) ? target[0] : target.source;
  const destinationRelative = Array.isArray(target) ? target[1] : target.destination;
  const sourcePath = path.join(rootDir, sourceRelative);
  const destinationPath = path.join(consultantRoot, destinationRelative);

  if (!fs.existsSync(sourcePath)) {
    console.error(`[sync] missing source: ${sourcePath}`);
    process.exitCode = 1;
    continue;
  }

  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.copyFileSync(sourcePath, destinationPath);

  const replacements = Array.isArray(target) ? [] : (target.replacements ?? []);
  if (replacements.length > 0) {
    let content = fs.readFileSync(destinationPath, 'utf8');
    for (const [from, to] of replacements) {
      content = content.replaceAll(from, to);
    }
    fs.writeFileSync(destinationPath, content, 'utf8');
  }

  console.log(`[sync] copied ${sourceRelative} -> ${destinationRelative}`);
}
