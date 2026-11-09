// Controlador de categorías: GET /categorias (público).
const service = require('../services/categorias.service');

async function listar(_req, res) {
  try { res.json(await service.listarCategorias()); }
  catch (e) { res.status(e.status || 500).json({ error: e.message }); }
}

module.exports = { listar };
