// Configuración central: ÚNICO lugar del proyecto que lee variables de entorno (.env).
require('dotenv').config();
const path = require('path');

module.exports = {
  puerto: process.env.PUERTO || 3010,
  apiKeyInterna: process.env.API_KEY_INTERNA || '',
  supabaseDbUrl: process.env.SUPABASE_DB_URL || '',
  // Carpeta de artículos .json; solo se usa en modo archivos (sin BD), como respaldo local.
  carpetaArticulos: path.resolve(__dirname, '..', '..', '..', process.env.CARPETA_ARTICULOS || '../articulos'),
};
