// Servicio de artículos: reglas de negocio (qué se muestra y qué se guarda).
const repo = require('../repositories/articulos.repository');
const { aPublico, validarArticulo } = require('../schemas/articulo.schema');

async function listarArticulos({ esAdmin, incluirBorradores, categoria, buscar, pagina, limite }) {
  const filas = await repo.listar({ incluirBorradores: esAdmin && incluirBorradores, categoria, buscar });
  // En modo archivos (respaldo local) se devuelve todo; con BD el repositorio ya filtró por estado.
  const todos = filas.map((f) => aPublico(f, false));
  // Paginación OPCIONAL: sin ?pagina ni ?limite se devuelve la lista completa
  // (comportamiento histórico que el build de la web espera). Con parámetros,
  // se corta la lista y el controlador informa el total en cabeceras X-*.
  if (pagina == null && limite == null) return { datos: todos, total: todos.length, paginado: false };
  const lim = Math.min(100, Math.max(1, Number.parseInt(limite, 10) || 20));
  const pag = Math.max(1, Number.parseInt(pagina, 10) || 1);
  const desde = (pag - 1) * lim;
  return { datos: todos.slice(desde, desde + lim), total: todos.length, paginado: true, pagina: pag, limite: lim, paginas: Math.max(1, Math.ceil(todos.length / lim)) };
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
    const err = new Error('Modo archivos: configura las llaves de Supabase (SUPABASE_URL + SUPABASE_SECRET_KEY) para insertar en la BD');
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
