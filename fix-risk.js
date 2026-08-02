const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/app/(dashboard)/ai-risk-assessment/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Add bmi to initial state
content = content.replace(
  /gender: '',\n\s+riskFactors: \[\] as string\[\]\n\s+\}\);/,
  "gender: '',\n    bmi: '',\n    riskFactors: [] as string[]\n  });"
);

// Fix setPetData missing fields around line 149
content = content.replace(
  /setPetData\(\{\n\s+name: fullPatient.name,\n\s+age: actualAge.toString\(\),\n\s+gender: fullPatient.gender \|\| '',\n\s+riskFactors: \[\]\n\s+\}\);/,
  `setPetData({
          name: fullPatient.name || '',
          species: fullPatient.species || '',
          breed: fullPatient.breed || '',
          age: actualAge.toString(),
          weight: fullPatient.weight?.toString() || '',
          gender: fullPatient.gender || '',
          bmi: '',
          riskFactors: []
        });`
);

// Fix setPetData missing fields around line 189
content = content.replace(
  /setPetData\(\{\n\s+name: selectedPet.name,\n\s+age: actualAge.toString\(\),\n\s+gender: selectedPet.gender \|\| '',\n\s+riskFactors: \[\]\n\s+\}\);/,
  `setPetData({
          name: selectedPet.name || '',
          species: selectedPet.species || '',
          breed: selectedPet.breed || '',
          age: actualAge.toString(),
          weight: selectedPet.weight?.toString() || '',
          gender: selectedPet.gender || '',
          bmi: '',
          riskFactors: []
        });`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed ai-risk-assessment');
