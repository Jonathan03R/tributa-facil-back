// App: crea Express, aplica middlewares globales y monta las rutas. No levanta el puerto (eso es server.js).
const express = require('express');
const { montarRutas } = require('./app-module-routes');

const app = express();
app.use(express.json({ limit: '1mb' }));
montarRutas(app);

module.exports = app;
