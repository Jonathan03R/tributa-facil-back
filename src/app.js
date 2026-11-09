// App: crea Express, aplica middlewares globales y monta las rutas. No levanta el puerto (eso es server.js).
const path = require('path');
const express = require('express');
const { montarRutas } = require('./app-module-routes');

const app = express();
app.use(express.json({ limit: '1mb' }));
// Imágenes de los artículos: el API entrega imagen_url como "img/<slug>.jpg"
// y este servidor sirve los archivos desde la carpeta img/ del proyecto.
app.use('/img', express.static(path.join(__dirname, '..', 'img'), { maxAge: '7d', fallthrough: false }));
montarRutas(app);

module.exports = app;
