const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, 'apps/web/app/(dashboard)');
const dirs = fs.readdirSync(dirPath);

dirs.forEach(dir => {
  if (dir.startsWith('ai-')) {
    const pagePath = path.join(dirPath, dir, 'page.tsx');
    if (fs.existsSync(pagePath)) {
      let content = fs.readFileSync(pagePath, 'utf8');

      content = content.replace(/import ProtectedRoute from '\.\.\/protected-route';\n/g, '');
      content = content.replace(/import SidebarLayout from '\.\.\/components\/sidebar-layout';\n/g, '');
      content = content.replace(/import \{ useTranslations \} from '\.\.\/hooks\/useTranslations';\n/g, 'import { useTranslations } from "next-intl";\n');
      
      content = content.replace(/const \{ t, translationsLoaded \} = useTranslations\(\);/g, 'const t = useTranslations();');
      content = content.replace(/const \{ t \} = useTranslations\(\);/g, 'const t = useTranslations();');
      
      // Remove loading block
      content = content.replace(/\/\/ Show loading state if translations aren't loaded yet[\s\S]*?if \(!translationsLoaded\) \{[\s\S]*?return \([\s\S]*?<\/ProtectedRoute>\s*\);\s*\}/g, '');
      content = content.replace(/if \(!translationsLoaded\) \{[\s\S]*?return \([\s\S]*?<\/ProtectedRoute>\s*\);\s*\}/g, '');
      
      // Remove SidebarLayout
      content = content.replace(/<SidebarLayout\s+title=\{t\('[^']+'\)\}\s+description=\{t\('[^']+'\)\}\s*>/g, '<div>');
      content = content.replace(/<SidebarLayout[^>]*>/g, '<div>');
      content = content.replace(/<\/SidebarLayout>/g, '</div>');

      // Remove ProtectedRoute opening and closing
      content = content.replace(/<ProtectedRoute>/g, '');
      content = content.replace(/<\/ProtectedRoute>/g, '');
      
      // Some formatting cleanup
      content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

      fs.writeFileSync(pagePath, content, 'utf8');
      console.log(`Updated ${pagePath}`);
    }
  }
});
