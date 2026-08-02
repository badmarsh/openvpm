const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/app/(dashboard)/ai-risk-assessment/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of the empty object pattern
const emptyObjPattern = /setPetData\(\{\n\s+name: '',\n\s+age: '',\n\s+gender: '',\n\s+bmi: '',\n\s+riskFactors: \[\]\n\s+\}\);/g;
const replacement = `setPetData({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        gender: '',
        bmi: '',
        riskFactors: []
      });`;

content = content.replace(emptyObjPattern, replacement);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed empty setPetData calls');
