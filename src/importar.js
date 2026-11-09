// Importador — lo usa Muse: lee ../articulos/*.json y los inserta vía POST /articulos del propio servidor.
// Uso: npm run importar   (el servidor debe estar corriendo y .env debe tener API_KEY_INTERNA)
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const CARPETA = path.resolve(__dirname, '..', process.env.CARPETA_ARTICULOS || '../articulos');
const URL = `http://127.0.0.1:${process.env.PUERTO || 3010}/articulos`;
(async () => {
  const archivos = fs.readdirSync(CARPETA).filter(f => f.endsWith('.json'));
  for (const f of archivos) {
    const articulo = JSON.parse(fs.readFileSync(path.join(CARPETA, f), 'utf8'));
    const r = await fetch(URL, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY_INTERNA || '' }, body: JSON.stringify(articulo) });
    console.log(f, r.status, await r.text());
  }
})();
