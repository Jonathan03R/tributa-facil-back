// Configuración central: ÚNICO lugar del proyecto que lee variables de entorno (.env).
require('dotenv').config();
const path = require('path');

module.exports = {
  puerto: process.env.PUERTO || 3010,
  apiKeyInterna: process.env.API_KEY_INTERNA || '',
  // Supabase SOLO por API (llaves) — prohibido usar cadena de conexión Postgres.
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabasePublishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || '',
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || '',
  // Carpeta de artículos .json; solo se usa en modo archivos (sin llaves), como respaldo local.
  carpetaArticulos: path.resolve(__dirname, '..', '..', '..', process.env.CARPETA_ARTICULOS || '../articulos'),
};
