const fs = require('fs');
let content = fs.readFileSync('app/components/admission/EvaluationSimulation.tsx', 'utf8');
content = content.replace(`import { pb } from '../lib/pocketbase';`, `import { pb } from '../../../lib/pocketbase';`);
content = content.replace(`from '../utils/evaluationLogic'`, `from '../../../lib/utils/evaluationLogic'`);
content = content.replace(`from '../utils/admissionLines'`, `from '../../../lib/utils/admissionLines'`);
content = content.replace(`from '../data/admissionData.json'`, `from '../../../data/admissionData.json'`);
fs.writeFileSync('app/components/admission/EvaluationSimulation.tsx', content, 'utf8');

let posContent = fs.readFileSync('app/components/admission/PositionDiagnosis.tsx', 'utf8');
posContent = posContent.replace(`from '../utils/admissionLines'`, `from '../../../lib/utils/admissionLines'`);
posContent = posContent.replace(`from '../data/admissionData.json'`, `from '../../../data/admissionData.json'`);
fs.writeFileSync('app/components/admission/PositionDiagnosis.tsx', posContent, 'utf8');
