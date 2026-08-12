const { Client } = require('pg');
const c = new Client('postgresql://openpims:openpims@localhost:5434/openpims');
c.connect()
  .then(() => c.query('SELECT slug, status, title FROM websites WHERE deleted_at IS NULL LIMIT 10'))
  .then(r => { console.log(JSON.stringify(r.rows, null, 2)); c.end(); })
  .catch(e => { console.error(e.message); c.end(); });
