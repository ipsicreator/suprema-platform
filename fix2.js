const fs = require('fs');
function fixFile(path) {
    let content = fs.readFileSync(path, 'utf8');
    if (!content.startsWith('"use client"')) {
        content = '"use client";\n' + content;
    }
    content = content.replace(/from '\.\.\/lib\/pocketbase'/g, "from '../../../lib/pocketbase'");
    content = content.replace(/from '\.\.\/utils\/evaluationLogic'/g, "from '../../../lib/utils/evaluationLogic'");
    content = content.replace(/from '\.\.\/utils\/admissionLines'/g, "from '../../../lib/utils/admissionLines'");
    content = content.replace(/from '\.\.\/data\/admissionData\.json'/g, "from '../../../data/admissionData.json'");
    fs.writeFileSync(path, content, 'utf8');
}
fixFile('app/components/admission/EvaluationSimulation.tsx');
fixFile('app/components/admission/PositionDiagnosis.tsx');
