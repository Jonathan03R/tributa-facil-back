// Servidor de artículos — Node.js + Express
// Guarda artículos en Supabase (Postgres, esquema contabilidad) y los sirve por endpoint.
// La web Astro SOLO consume: GET /articulos y GET /articulos/:slug
// Muse inserta con: POST /articulos (header x-api-key) — ver src/importar.js
// Si falta SUPABASE_DB_URL, arranca en MODO ARCHIVOS (solo lectura desde ../articulos/*.json).
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');

const PUERTO = process.env.PUERTO || 3010;
const API_KEY = process.env.API_KEY_INTERNA || '';
const CARPETA = path.resolve(__dirname, '..', process.env.CARPETA_ARTICULOS || '../articulos');
const conBD = Boolean(process.env.SUPABASE_DB_URL);

let pool = null;
if (conBD) {
  const { Pool } = require('pg');
  pool = new Pool({ connectionString: process.env.SUPABASE_DB_URL, ssl: { rejectUnauthorized: false } });
}

const app = express();
app.use(express.json({ limit: '1mb' }));

const esAdmin = (req) => API_KEY && req.get('x-api-key') === API_KEY;
const aPublico = (r) => ({
  titulo: r.articulo_titulo || r.titulo, slug: r.articulo_slug || r.slug, descripcion: r.articulo_descripcion || r.descripcion,
  resumen: r.articulo_resumen || r.resumen, categoria: r.categoria_codigo || r.categoria,
  etiquetas: r.articulo_etiquetas || r.etiquetas || [], palabra_clave: r.articulo_palabra_clave || r.palabra_clave,
  fecha_publicacion: r.articulo_fecha_publicacion || r.fecha_publicacion, autor: r.articulo_autor || r.autor,
  fuente_nombre: r.articulo_fuente_nombre || r.fuente_nombre, fuente_url: r.articulo_fuente_url || r.fuente_url,
  norma_relacionada: r.articulo_norma_relacionada || r.norma_relacionada, vigencia: r.articulo_vigencia || r.vigencia,
  tiempo_lectura_min: r.articulo_tiempo_lectura_min || r.tiempo_lectura_min,
  estado: (r.articulo_estado || r.estado || 'BORRADOR').toLowerCase(),
  contenido_markdown: r.articulo_contenido_markdown || r.contenido_markdown
});
const leerArchivos = () => fs.readdirSync(CARPETA).filter(f => f.endsWith('.json'))
  .map(f => { const a = JSON.parse(fs.readFileSync(path.join(CARPETA, f), 'utf8')); return a; });

app.get('/salud', (_req, res) => res.json({ estado: 'ok', modo: conBD ? 'supabase' : 'archivos' }));

app.get('/articulos', async (req, res) => {
  try {
    const verBorradores = esAdmin(req) && req.query.incluir_borradores === 'true';
    if (!conBD) {
      let lista = leerArchivos().filter(a => verBorradores || a.articulo_estado === 'PUBLICADO' || true); // modo local de prueba: devuelve todo
      return res.json(lista.map(a => { const p = aPublico(a); delete p.contenido_markdown; return p; }));
    }
    const cond = verBorradores ? "a.articulo_estado in ('BORRADOR','PUBLICADO')" : "a.articulo_estado = 'PUBLICADO'";
    const { rows } = await pool.query(
      `select a.*, c.categoria_codigo from contabilidad.articulos a
       join catalogos.categorias c on c.categoria_id = a.categoria_id
       where a.activo = true and ${cond} order by a.articulo_fecha_publicacion desc, a.articulo_id desc`);
    res.json(rows.map(r => { const p = aPublico(r); delete p.contenido_markdown; return p; }));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/articulos/:slug', async (req, res) => {
  try {
    if (!conBD) {
      const a = leerArchivos().find(x => x.slug === req.params.slug);
      return a ? res.json(aPublico(a)) : res.status(404).json({ error: 'no encontrado' });
    }
    const { rows } = await pool.query(
      `select a.*, c.categoria_codigo from contabilidad.articulos a
       join catalogos.categorias c on c.categoria_id = a.categoria_id
       where a.activo = true and a.articulo_slug = $1 limit 1`, [req.params.slug]);
    if (!rows.length) return res.status(404).json({ error: 'no encontrado' });
    if (rows[0].articulo_estado !== 'PUBLICADO' && !esAdmin(req)) return res.status(404).json({ error: 'no encontrado' });
    res.json(aPublico(rows[0]));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Inserción (la usa Muse/importador). Mismo JSON que los archivos de artículos.
app.post('/articulos', async (req, res) => {
  if (!esAdmin(req)) return res.status(401).json({ error: 'x-api-key inválida o ausente' });
  if (!conBD) return res.status(501).json({ error: 'Modo archivos: configura SUPABASE_DB_URL para insertar en la BD' });
  const a = req.body || {};
  if (!a.titulo || !a.slug || !a.contenido_markdown) return res.status(400).json({ error: 'faltan titulo, slug o contenido_markdown' });
  try {
    const cat = await pool.query('select categoria_id from catalogos.categorias where categoria_codigo = $1', [(a.categoria || 'CONTABILIDAD').toUpperCase()]);
    if (!cat.rows.length) return res.status(400).json({ error: 'categoria no existe en el catálogo' });
    const estado = (a.estado || 'borrador').toUpperCase();
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
       a.palabra_clave || null, a.fecha_publicacion || new Date().toISOString().slice(0, 10), a.autor || 'Jonathan Roque',
       a.fuente_nombre || null, a.fuente_url || null, a.norma_relacionada || null, a.vigencia || null,
       a.tiempo_lectura_min || 4, estado, a.contenido_markdown]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PUERTO, () => console.log(`servidor-articulos en http://127.0.0.1:${PUERTO} (modo: ${conBD ? 'supabase' : 'archivos'})`));
