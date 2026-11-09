// Esquema del artículo: claves del contrato con la web y mapeo BD/archivo -> formato público.
// El contrato completo está en docs/PARAMETROS-WEB.md.

const CATEGORIAS = ['SUNAT', 'TRIBUTARIO', 'IGV', 'RENTA', 'PLANILLAS', 'COMPROBANTES', 'CONTABILIDAD'];
const ESTADOS = ['BORRADOR', 'PUBLICADO', 'ARCHIVADO'];

// Valida lo mínimo para guardar un artículo. Devuelve el error o null si está ok.
function validarArticulo(a) {
  if (!a || !a.titulo || !a.slug || !a.contenido_markdown) return 'faltan titulo, slug o contenido_markdown';
  if (a.categoria && !CATEGORIAS.includes(String(a.categoria).toUpperCase())) return 'categoria no existe en el catálogo';
  return null;
}

// Normaliza un registro (fila de BD o JSON de archivo) al formato público que consume la web.
function aPublico(r, incluirContenido = true) {
  const pub = {
    titulo: r.articulo_titulo || r.titulo,
    slug: r.articulo_slug || r.slug,
    descripcion: r.articulo_descripcion || r.descripcion,
    resumen: r.articulo_resumen || r.resumen,
    categoria: r.categoria_codigo || r.categoria,
    etiquetas: r.articulo_etiquetas || r.etiquetas || [],
    palabra_clave: r.articulo_palabra_clave || r.palabra_clave,
    fecha_publicacion: r.articulo_fecha_publicacion || r.fecha_publicacion,
    autor: r.articulo_autor || r.autor,
    fuente_nombre: r.articulo_fuente_nombre || r.fuente_nombre,
    fuente_url: r.articulo_fuente_url || r.fuente_url,
    norma_relacionada: r.articulo_norma_relacionada || r.norma_relacionada,
    vigencia: r.articulo_vigencia || r.vigencia,
    tiempo_lectura_min: r.articulo_tiempo_lectura_min || r.tiempo_lectura_min,
    estado: (r.articulo_estado || r.estado || 'BORRADOR').toLowerCase(),
  };
  if (incluirContenido) pub.contenido_markdown = r.articulo_contenido_markdown || r.contenido_markdown;
  return pub;
}

module.exports = { CATEGORIAS, ESTADOS, validarArticulo, aPublico };
