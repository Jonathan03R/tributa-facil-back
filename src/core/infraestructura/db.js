// Infraestructura: conexión a Postgres (Supabase) vía pooler.
// Si no hay SUPABASE_DB_URL, exporta null y el sistema trabaja en modo archivos.
const config = require('../config/env');

let pool = null;
if (config.supabaseDbUrl) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: config.supabaseDbUrl, ssl: { rejectUnauthorized: false } });
}

module.exports = { pool, conBD: Boolean(pool) };
