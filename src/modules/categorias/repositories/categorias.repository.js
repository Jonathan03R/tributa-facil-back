// Repositorio de categorías: catálogo oficial en catalogos.categorias (Supabase vía API).
// Sin llaves (modo archivos): deriva del catálogo fijo y de los .json locales.
const fs = require('fs');
const path = require('path');
const { supabase, conBD } = require('../../../core/infraestructura/db');
const config = require('../../../core/config/env');
const { CATEGORIAS } = require('../../articulos/schemas/articulo.schema');

async function listarConConteo() {
  if (!conBD) {
    const conteo = {};
    for (const f of fs.readdirSync(config.carpetaArticulos).filter((x) => x.endsWith('.json'))) {
      const a = JSON.parse(fs.readFileSync(path.join(config.carpetaArticulos, f), 'utf8'));
      if ((a.estado || 'borrador') === 'publicado') {
        const cod = String(a.categoria || '').toUpperCase();
        conteo[cod] = (conteo[cod] || 0) + 1;
      }
    }
    return CATEGORIAS.map((codigo) => ({ codigo, total_publicados: conteo[codigo] || 0 }));
  }
  const { data: cats, error } = await supabase.schema('catalogos').from('categorias')
    .select('categoria_id, categoria_codigo').eq('activo', true).order('categoria_codigo');
  if (error) throw new Error(error.message);
  const { data: arts, error: e2 } = await supabase.schema('contabilidad').from('articulos')
    .select('categoria_id').eq('activo', true).eq('articulo_estado', 'PUBLICADO');
  if (e2) throw new Error(e2.message);
  const conteo = {};
  for (const a of arts || []) conteo[String(a.categoria_id)] = (conteo[String(a.categoria_id)] || 0) + 1;
  return (cats || []).map((c) => ({ codigo: c.categoria_codigo, total_publicados: conteo[String(c.categoria_id)] || 0 }));
}

module.exports = { listarConConteo };
