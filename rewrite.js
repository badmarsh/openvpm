const fs = require('fs');
let content = fs.readFileSync('apps/web/server/routers/communications.ts', 'utf8');

content = content.replace(
  'import { eq, and, desc, sql, isNull, or, ne, isNotNull } from "drizzle-orm";',
  'import { eq, and, desc, sql, isNull, or, ne, isNotNull, not } from "drizzle-orm";'
);

fs.writeFileSync('apps/web/server/routers/communications.ts', content);
