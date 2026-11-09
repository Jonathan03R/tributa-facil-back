# Parámetros que recibe la web — Contrato del puente

Jonathan hará el puente DESPUÉS. La web solo muestra limpiamente estos parámetros; Muse escribe todo el contenido.

## Archivos por artículo
Por cada artículo se entregan 2 archivos gemelos en `files/articulos/`:
- `<slug>.json` — para que el puente lo lea por API/archivo (recomendado)
- `<slug>.md` — el mismo artículo en Markdown con frontmatter (ideal si la web es Astro)

## Parámetros (claves del JSON)
| Parámetro | Tipo | Uso en la web |
|---|---|---|
| titulo | string | H1 y <title> SEO |
| slug | string | URL: /<slug>/ |
| descripcion | string | Meta description (140-160 caracteres) |
| resumen | string | Texto corto en listados y portada |
| categoria | string | SUNAT, Tributario, IGV, Renta, Planillas, Comprobantes Electrónicos o Contabilidad |
| etiquetas | string[] | Tags del artículo |
| palabra_clave | string | Keyword SEO principal |
| fecha_publicacion | string (YYYY-MM-DD) | Fecha del artículo |
| autor | string | Autor mostrado |
| fuente_nombre | string | Fuente de la noticia |
| fuente_url | string | Enlace a la fuente |
| norma_relacionada | string o null | Ej. R.S. N.° 000213-2026/SUNAT |
| vigencia | string o null | Desde cuándo rige |
| tiempo_lectura_min | number | Minutos estimados |
| estado | string | Siempre "borrador" hasta que Jonathan lo apruebe |
| contenido_markdown | string | Cuerpo completo del artículo en Markdown |

## Ejemplo mínimo de consumo (puente)
```js
const articulo = await fetch('/articulos/sire-regularizar-sin-multa-2027.json').then(r => r.json());
// la web pinta: articulo.titulo, articulo.etiquetas, articulo.contenido_markdown, etc.
```
