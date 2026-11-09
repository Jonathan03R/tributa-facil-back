// Controlador de artículos: traduce HTTP <-> servicio. Sin lógica de negocio ni SQL aquí.
const service = require('../services/articulos.service');
const { esAdmin, requerirApiKey } = require('../../../core/middlewares/api-key');

async function listar(req, res) {
  try {
    const datos = await service.listarArticulos({
      esAdmin: esAdmin(req),
      incluirBorradores: req.query.incluir_borradores === 'true',
      categoria: req.query.categoria || null,
      buscar: req.query.buscar || req.query.q || null,
    });
    res.json(datos);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
}

async function obtener(req, res) {
  try {
    const dato = await service.obtenerArticulo(req.params.slug, { esAdmin: esAdmin(req) });
    if (!dato) return res.status(404).json({ error: 'no encontrado' });
    res.json(dato);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
}

async function crear(req, res) {
  try {
    const fila = await service.guardarArticulo(req.body || {});
    res.status(201).json(fila);
  } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
}

module.exports = { listar, obtener, crear, requerirApiKey };
