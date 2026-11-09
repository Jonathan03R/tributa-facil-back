// App: crea Express, aplica middlewares globales y monta las rutas. No levanta el puerto (eso es server.js).
const path = require('path');
const express = require('express');
const { montarRutas } = require('./app-module-routes');
const { cors } = require('./core/middlewares/cors');

const app = express();
app.disable('x-powered-by'); // no anunciar el stack
app.use(cors); // solo orígenes conocidos (ver core/middlewares/cors.js)
app.use(express.json({ limit: '1mb' }));
// Respaldo local: sirve la carpeta img/ del proyecto. En producción las
// imágenes oficiales viven en Supabase Storage (imagen_url absoluta).
app.use('/img', express.static(path.join(__dirname, '..', 'img'), { maxAge: '7d', fallthrough: false }));
montarRutas(app);

module.exports = app;
