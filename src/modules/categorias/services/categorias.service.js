// Servicio de categorías: lo que el front necesita para pintar el menú y las páginas por categoría.
const repo = require('../repositories/categorias.repository');

async function listarCategorias() {
  return repo.listarConConteo();
}

module.exports = { listarCategorias };
