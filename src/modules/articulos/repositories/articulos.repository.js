// Repositorio de artículos: ÚNICO lugar que toca los datos.
// Con BD: SQL contra contabilidad.articulos (Supabase). Sin BD: lee los .json de la carpeta local.
const fs = require('fs');
const path = require('path');
const { pool, conBD } = require('../../../core/infraestructura/db');
const config = require('../../../core/config/env');

function leerDesdeArchivos() {
  return fs.readdirSync(config.carpetaArticulos)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(config.carpetaArticulos, f), 'utf8')));
}

async function listar({ incluirBorradores }) {
  if (!conBD) return leerDesdeArchivos();
  const cond = incluirBorradores
    ? "a.articulo_estado in ('BORRADOR','PUBLICADO')"
    : "a.articulo_estado = 'PUBLICADO'";
  const { rows } = await pool.query(
    `select a.*, c.categoria_codigo from contabilidad.articulos a
     join catalogos.categorias c on c.categoria_id = a.categoria_id
     where a.activo = true and ${cond}
     order by a.articulo_fecha_publicacion desc, a.articulo_id desc`);
  return rows;
}

async function obtenerPorSlug(slug) {
  if (!conBD) return leerDesdeArchivos().find((a) => a.slug === slug) || null;
  const { rows } = await pool.query(
    `select a.*, c.categoria_codigo from contabilidad.articulos a
     join catalogos.categorias c on c.categoria_id = a.categoria_id
     where a.activo = true and a.articulo_slug = $1 limit 1`, [slug]);
  return rows[0] || null;
}

// Inserta o actualiza por slug (upsert). Devuelve la fila guardada.
async function guardar(a) {
  const cat = await pool.query(
    'select categoria_id from catalogos.categorias where categoria_codigo = $1',
    [(a.categoria || 'CONTABILIDAD').toUpperCase()]);
  if (!cat.rows.length) return null;
  const { rows } = await pool.query(
    `insert into contabilidad.articulos
     (categoria_id, articulo_titulo, articulo_slug, articulo_descripcion, articulo_resumen, articulo_etiquetas,
      articulo_palabra_clave, articulo_fecha_publicacion, articulo_autor, articulo_fuente_nombre, articulo_fuente_url,
      articulo_norma_relacionada, articulo_vigencia, articulo_tiempo_lectura_min, articulo_estado, articulo_contenido_markdown)
     values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
     on conflict (articulo_slug) where activo = true do update set
      categoria_id = excluded.categoria_id, articulo_titulo = excluded.articulo_titulo,
      articulo_descripcion = excluded.articulo_descripcion, articulo_resumen = excluded.articulo_resumen,
      articulo_etiquetas = excluded.articulo_etiquetas, articulo_contenido_markdown = excluded.articulo_contenido_markdown,
      articulo_estado = excluded.articulo_estado, fecha_actualizacion = now()
     returning articulo_id, articulo_slug, articulo_estado`,
    [cat.rows[0].categoria_id, a.titulo, a.slug, a.descripcion || null, a.resumen || null, a.etiquetas || [],
     a.palabra_clave || null, a.fecha_publicacion || new Date().toISOString().slice(0, 10),
     a.autor || 'Jonathan Roque', a.fuente_nombre || null, a.fuente_url || null,
     a.norma_relacionada || null, a.vigencia || null, a.tiempo_lectura_min || 4,
     (a.estado || 'borrador').toUpperCase(), a.contenido_markdown]);
  return rows[0];
}

module.exports = { listar, obtenerPorSlug, guardar, conBD };
