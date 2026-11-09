// Rutas del módulo artículos.
const express = require('express');
const controller = require('./controllers/articulos.controller');

const router = express.Router();
router.get('/', controller.listar);                          // GET    /articulos
router.get('/:slug', controller.obtener);                    // GET    /articulos/:slug
router.post('/', controller.requerirApiKey, controller.crear); // POST   /articulos (solo Muse, con clave)

module.exports = router;
