// Script importador: lo usa Muse para subir los artículos .json a la BD a través del propio servidor.
// Uso: npm run importar  (el servidor debe estar corriendo; lee la clave interna del .env)
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const carpeta = path.resolve(__dirname, '..', process.env.CARPETA_ARTICULOS || '../articulos');
const url = `http://127.0.0.1:${process.env.PUERTO || 3010}/articulos`;

(async () => {
  for (const f of fs.readdirSync(carpeta).filter((x) => x.endsWith('.json'))) {
    const articulo = JSON.parse(fs.readFileSync(path.join(carpeta, f), 'utf8'));
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.API_KEY_INTERNA || '' },
      body: JSON.stringify(articulo),
    });
    console.log(f, r.status, await r.text());
  }
})();
