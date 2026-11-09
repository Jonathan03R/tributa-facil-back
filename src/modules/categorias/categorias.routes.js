// Rutas del módulo categorías.
const express = require('express');
const controller = require('./controllers/categorias.controller');

const router = express.Router();
router.get('/', controller.listar); // GET /categorias

module.exports = router;
