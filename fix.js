const fs = require('fs');
const path = require('path');

// 1. Fix ai-models schema imports
const apiDir = path.join(__dirname, 'apps/web/app/api/ai-models');
function fixApiRoute(filePath) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/@openpims\/db\/schema/g, '@openpims/db');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}
fixApiRoute(path.join(apiDir, 'route.ts'));
fixApiRoute(path.join(apiDir, 'active/route.ts'));
fixApiRoute(path.join(apiDir, 'test/route.ts'));

// 2. Fix schema inference
const schemaPath = path.join(__dirname, 'packages/db/schema/ai-models.ts');
let schemaContent = fs.readFileSync(schemaPath, 'utf8');
schemaContent = schemaContent.replace(/import \{ z \} from "zod";\n/g, '');
schemaContent = schemaContent.replace(/export type AiModel = z\.infer<typeof selectAiModelSchema>;\n/g, '');
schemaContent = schemaContent.replace(/export type NewAiModel = z\.infer<typeof insertAiModelSchema>;\n/g, '');
if (!schemaContent.includes('InferSelectModel')) {
  schemaContent = 'import type { InferSelectModel, InferInsertModel } from "drizzle-orm";\n' + schemaContent;
  schemaContent += 'export type AiModel = InferSelectModel<typeof aiModels>;\n';
  schemaContent += 'export type NewAiModel = InferInsertModel<typeof aiModels>;\n';
}
fs.writeFileSync(schemaPath, schemaContent, 'utf8');
console.log(`Updated schema in ${schemaPath}`);

// 3. Fix app/(dashboard)/ai-* imports
const dashboardDir = path.join(__dirname, 'apps/web/app/(dashboard)');
const dirs = fs.readdirSync(dashboardDir);

dirs.forEach(dir => {
  if (dir.startsWith('ai-') || dir === 'agent') {
    const processDir = (targetDir) => {
      const files = fs.readdirSync(targetDir);
      files.forEach(file => {
        const fullPath = path.join(targetDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          processDir(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
          let content = fs.readFileSync(fullPath, 'utf8');
          content = content.replace(/\.\.\/\.\.\/lib\//g, '@/lib/');
          content = content.replace(/\.\.\/\.\.\/\.\.\/lib\//g, '@/lib/');
          content = content.replace(/\.\.\/components\//g, '@/components/ai/');
          content = content.replace(/setPatientSymptoms/g, 'setPetSymptoms');
          content = content.replace(/setPatientDiagnosis/g, 'setPetDiagnosis');
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`Updated ${fullPath}`);
        }
      });
    };
    processDir(path.join(dashboardDir, dir));
  }
});
