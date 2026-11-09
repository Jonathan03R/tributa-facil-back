// Controlador de artículos: traduce HTTP <-> servicio. Sin lógica de negocio ni SQL aquí.
const service = require('../services/articulos.service');
const { esAdmin, requerirApiKey } = require('../../../core/middlewares/api-key');

async function listar(req, res) {
  try {
    const r = await service.listarArticulos({
      esAdmin: esAdmin(req),
      incluirBorradores: req.query.incluir_borradores === 'true',
      categoria: req.query.categoria || null,
      buscar: req.query.buscar || req.query.q || null,
      pagina: req.query.pagina ?? null,
      limite: req.query.limite ?? null,
    });
    // El cuerpo sigue siendo un arreglo (contrato con el front); la
    // paginación se informa en cabeceras cuando se pide.
    if (r.paginado) {
      res.set({ 'X-Total': r.total, 'X-Pagina': r.pagina, 'X-Limite': r.limite, 'X-Paginas': r.paginas });
    }
    res.json(r.datos);
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
