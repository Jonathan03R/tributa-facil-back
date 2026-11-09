// Server: punto de entrada. Solo levanta la app en el puerto configurado.
const app = require('./app');
const config = require('./core/config/env');
const { conBD } = require('./core/infraestructura/db');

app.listen(config.puerto, () => {
  console.log(`servidor-articulos en http://127.0.0.1:${config.puerto} (modo: ${conBD ? 'supabase' : 'archivos'})`);
});
