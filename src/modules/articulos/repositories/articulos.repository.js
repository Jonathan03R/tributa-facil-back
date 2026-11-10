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

const coincideBusqueda = (a, texto) => {
  const t = texto.toLowerCase();
  const campos = [a.titulo, a.slug, a.palabra_clave, a.descripcion, a.h1,
    ...(a.palabras_clave_secundarias || []), ...(a.etiquetas || [])]
    .filter(Boolean).join(' ').toLowerCase();
  return campos.includes(t);
};

async function listar({ incluirBorradores, categoria, buscar }) {
  if (!conBD) {
    const todos = leerDesdeArchivos();
    let salida = categoria ? todos.filter((a) => String(a.categoria || '').toUpperCase() === categoria.toUpperCase()) : todos;
    if (buscar) salida = salida.filter((a) => coincideBusqueda(a, buscar));
    return salida;
  }
  let q = dbArticulos().select('*').eq('activo', true)
    .order('articulo_fecha_publicacion', { ascending: false })
    .order('articulo_id', { ascending: false });
  q = incluirBorradores ? q.in('articulo_estado', ['BORRADOR', 'PUBLICADO']) : q.eq('articulo_estado', 'PUBLICADO');
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  const mapa = await mapaCategorias();
  const filas = (data || []).map((f) => conCategoria(f, mapa));
  let salida = categoria ? filas.filter((f) => (f.categoria_codigo || '').toUpperCase() === categoria.toUpperCase()) : filas;
  if (buscar) {
    const crudos = new Map(salida.map((f) => [f.slug || f.articulo_slug, f]));
    salida = salida.filter((f) => coincideBusqueda({
      titulo: f.articulo_titulo, slug: f.articulo_slug, palabra_clave: f.articulo_palabra_clave,
      descripcion: f.articulo_descripcion, h1: f.articulo_h1,
      palabras_clave_secundarias: f.articulo_palabras_clave_secundarias, etiquetas: f.articulo_etiquetas,
    }, buscar));
    void crudos;
  }
  return salida;
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
  if (previa) {
    const res = await dbArticulos().update(fila).eq('articulo_id', previa.articulo_id).select(cols).single();
    if (res.error) throw new Error(res.error.message);
    return res.data;
  }

  // Inserción automática SIN depender de la secuencia de la BD: la llave secreta
  // no tiene permiso sobre articulos_articulo_id_seq (falla con "permission denied
  // for sequence"), así que asignamos el id explícitamente (máximo actual + 1).
  // Al venir el id en la fila, Postgres no llama a la secuencia y el alta funciona
  // solo con las llaves de la API, sin pasos manuales en Supabase.
  for (let intento = 0; intento < 5; intento++) {
    const { data: tope, error: eTope } = await dbArticulos().select('articulo_id')
      .order('articulo_id', { ascending: false }).limit(1).maybeSingle();
    if (eTope) throw new Error(eTope.message);
    const nuevoId = (tope ? Number(tope.articulo_id) : 0) + 1 + intento;
    const res = await dbArticulos().insert({ ...fila, articulo_id: nuevoId }).select(cols).single();
    if (!res.error) return res.data;
    // Solo reintenta si otro alta simultánea tomó ese id (choque de clave primaria).
    if (!/duplicate key|already exists/i.test(res.error.message)) throw new Error(res.error.message);
  }
  throw new Error('No se pudo asignar un id libre para el artículo tras varios intentos');
}

module.exports = { listar, obtenerPorSlug, guardar, conBD };
