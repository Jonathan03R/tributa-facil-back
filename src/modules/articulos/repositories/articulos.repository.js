// Repositorio de artículos: ÚNICO lugar que toca los datos.
// Con llaves: API de Supabase (REST) sobre contabilidad.articulos. Sin llaves: lee los .json locales.
const fs = require('fs');
const path = require('path');
const { supabase, conBD } = require('../../../core/infraestructura/db');
const config = require('../../../core/config/env');

const dbArticulos = () => supabase.schema('contabilidad').from('articulos');
const dbCategorias = () => supabase.schema('catalogos').from('categorias');

function leerDesdeArchivos() {
  return fs.readdirSync(config.carpetaArticulos)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(config.carpetaArticulos, f), 'utf8')));
}

// Mapa categoria_id -> categoria_codigo (las filas de la BD traen solo el id).
async function mapaCategorias() {
  const { data, error } = await dbCategorias().select('categoria_id, categoria_codigo');
  if (error) throw new Error(error.message);
  return new Map((data || []).map((c) => [String(c.categoria_id), c.categoria_codigo]));
}

const conCategoria = (fila, mapa) => ({ ...fila, categoria_codigo: mapa.get(String(fila.categoria_id)) || null });

async function listar({ incluirBorradores }) {
  if (!conBD) return leerDesdeArchivos();
  let q = dbArticulos().select('*').eq('activo', true)
    .order('articulo_fecha_publicacion', { ascending: false })
    .order('articulo_id', { ascending: false });
  q = incluirBorradores ? q.in('articulo_estado', ['BORRADOR', 'PUBLICADO']) : q.eq('articulo_estado', 'PUBLICADO');
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const mapa = await mapaCategorias();
  return (data || []).map((f) => conCategoria(f, mapa));
}

async function obtenerPorSlug(slug) {
  if (!conBD) return leerDesdeArchivos().find((a) => a.slug === slug) || null;
  const { data, error } = await dbArticulos().select('*')
    .eq('activo', true).eq('articulo_slug', slug).limit(1).maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const mapa = await mapaCategorias();
  return conCategoria(data, mapa);
}

// Inserta o actualiza por slug (sin duplicar). Devuelve la fila guardada.
async function guardar(a) {
  const { data: cat, error: eCat } = await dbCategorias().select('categoria_id')
    .eq('categoria_codigo', (a.categoria || 'CONTABILIDAD').toUpperCase()).limit(1).maybeSingle();
  if (eCat) throw new Error(eCat.message);
  if (!cat) return null;

  const fila = {
    categoria_id: cat.categoria_id,
    articulo_titulo: a.titulo,
    articulo_slug: a.slug,
    articulo_descripcion: a.descripcion || null,
    articulo_resumen: a.resumen || null,
    articulo_etiquetas: a.etiquetas || [],
    articulo_palabra_clave: a.palabra_clave || null,
    articulo_fecha_publicacion: a.fecha_publicacion || new Date().toISOString().slice(0, 10),
    articulo_autor: a.autor || 'Jonathan Roque',
    articulo_fuente_nombre: a.fuente_nombre || null,
    articulo_fuente_url: a.fuente_url || null,
    articulo_norma_relacionada: a.norma_relacionada || null,
    articulo_vigencia: a.vigencia || null,
    articulo_tiempo_lectura_min: a.tiempo_lectura_min || 4,
    articulo_estado: (a.estado || 'borrador').toUpperCase(),
    articulo_contenido_markdown: a.contenido_markdown,
    articulo_h1: a.h1 || null,
    articulo_imagen_url: a.imagen_url || null,
    articulo_imagen_alt: a.imagen_alt || null,
    articulo_imagen_credito: a.imagen_credito || null,
    articulo_palabras_clave_secundarias: a.palabras_clave_secundarias || [],
  };

  const { data: previa } = await dbArticulos().select('articulo_id')
    .eq('activo', true).eq('articulo_slug', a.slug).limit(1).maybeSingle();

  const cols = 'articulo_id, articulo_slug, articulo_estado';
  const res = previa
    ? await dbArticulos().update(fila).eq('articulo_id', previa.articulo_id).select(cols).single()
    : await dbArticulos().insert(fila).select(cols).single();
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

module.exports = { listar, obtenerPorSlug, guardar, conBD };
