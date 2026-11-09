// Monta las rutas de todos los módulos en la app (equivalente a app-module-routes.ts de la referencia).
const articulosRoutes = require('./modules/articulos/articulos.routes');
const { conBD } = require('./core/infraestructura/db');

function montarRutas(app) {
  app.get('/salud', (_req, res) => res.json({ estado: 'ok', modo: conBD ? 'supabase' : 'archivos' }));
  app.use('/articulos', articulosRoutes);
}

module.exports = { montarRutas };
