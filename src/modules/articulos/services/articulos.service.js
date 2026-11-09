// Servicio de artículos: reglas de negocio (qué se muestra y qué se guarda).
const repo = require('../repositories/articulos.repository');
const { aPublico, validarArticulo } = require('../schemas/articulo.schema');

async function listarArticulos({ esAdmin, incluirBorradores }) {
  const filas = await repo.listar({ incluirBorradores: esAdmin && incluirBorradores });
  // En modo archivos (respaldo local) se devuelve todo; con BD el repositorio ya filtró por estado.
  return filas.map((f) => aPublico(f, false));
}

async function obtenerArticulo(slug, { esAdmin }) {
  const fila = await repo.obtenerPorSlug(slug);
  if (!fila) return null;
  const pub = aPublico(fila, true);
  if (pub.estado !== 'publicado' && !esAdmin) return null; // los borradores no son públicos
  return pub;
}

async function guardarArticulo(a) {
  if (!repo.conBD) {
    const err = new Error('Modo archivos: configura SUPABASE_DB_URL para insertar en la BD');
    err.status = 501;
    throw err;
  }
  const error = validarArticulo(a);
  if (error) { const e = new Error(error); e.status = 400; throw e; }
  const fila = await repo.guardar(a);
  if (!fila) { const e = new Error('categoria no existe en el catálogo'); e.status = 400; throw e; }
  return fila;
}

module.exports = { listarArticulos, obtenerArticulo, guardarArticulo };
