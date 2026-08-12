import postgres from "postgres";
const sql = postgres("postgresql://openpims:openpims@localhost:5434/openpims");
const rows = await sql`SELECT slug, status, title FROM websites WHERE deleted_at IS NULL LIMIT 10`;
console.log(JSON.stringify(rows, null, 2));
await sql.end();
