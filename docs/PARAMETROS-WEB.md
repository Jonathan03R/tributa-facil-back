# Contrato de parámetros para la web — v2 SEO (2026-11-09)

La web Astro consume el endpoint del servidor (`GET /articulos`, `GET /articulos/:slug`)
y recibe cada artículo con estos parámetros. El servidor SOLO guarda y sirve;
toda la preparación SEO viene hecha en los datos, lista para imprimir.

## Parámetros del artículo
| Parámetro | Para qué lo usa la web |
|---|---|
| `titulo` | Title SEO de la pestaña y de Google (<title> y og:title). Impactante, con la palabra clave. |
| `h1` | El ÚNICO <h1> visible de la página. La web lo imprime como H1; el contenido NUNCA trae otro H1. |
| `slug` | URL del artículo: /blog/<slug>. Corto, sin acentos, con la palabra clave. |
| `descripcion` | Meta description (140-160 caracteres, con palabra clave y gancho). También og:description. |
| `resumen` | Texto corto para tarjetas/listados de portada y categorías. |
| `categoria` | Una de: SUNAT, TRIBUTARIO, IGV, RENTA, PLANILLAS, COMPROBANTES, CONTABILIDAD (código en la BD). |
| `etiquetas` | Tags clicables y enlaces internos. |
| `palabra_clave` | Keyword principal SEO del artículo. |
| `palabras_clave_secundarias` | Keywords de apoyo (long-tail) que el texto también trabaja. |
| `imagen_url` | Imagen destacada (1 por artículo). Ruta `img/<slug>.jpg` junto a los artículos; la web la sirve como imagen principal y og:image. |
| `imagen_alt` | Texto alternativo de la imagen, con la palabra clave (SEO de imágenes y accesibilidad). |
| `imagen_credito` | Fuente/crédito de la imagen (banco de imágenes libre). |
| `fecha_publicacion` | Fecha visible y schema.org datePublished. |
| `autor` | "Jonathan Roque" (schema.org author). |
| `fuente_nombre` / `fuente_url` | Fuente oficial de la noticia; la web la enlaza al final (confianza/E-E-A-T). |
| `norma_relacionada` | R.S./resolución aplicable o null. |
| `vigencia` | Desde cuándo rige o null. |
| `tiempo_lectura_min` | Minutos estimados de lectura. |
| `estado` | borrador | publicado | archivado. Público solo ve "publicado". |
| `contenido_markdown` | Cuerpo en Markdown SIN H1: empieza con el párrafo introductorio y usa ## (H2) y ### (H3). |

## Reglas SEO con las que se escribe cada artículo
1. **Título impactante**: palabra clave + gancho real (pregunta, cifra, plazo o consecuencia:
   multa, rechazo, beneficio). Nada de clickbait falso: el gancho sale del dato duro verificado.
2. **H1 único y distinto del título**: resume la promesa del artículo en lenguaje del lector.
   La web imprime `h1`; el Markdown no contiene ningún `#`.
3. **Palabra clave ubicada**: título, h1, slug, descripción, primeras 100 palabras del
   contenido, al menos un subtítulo ## y el `imagen_alt`.
4. **Negritas listas para el front**: la palabra clave y los términos/datos clave van en
   **negrita** en el Markdown; la web los renderiza como <strong>. Primera aparición de la
   keyword siempre en negrita.
5. **Extensión**: mínimo 300 palabras; objetivo 600-1000. Estructura con ## H2 por sección
   (Qué cambió, A quién afecta, Desde cuándo, Qué debes hacer, Errores comunes, FAQ, Fuente oficial).
6. **Imagen**: 1 por artículo, horizontal, guardada como `img/<slug>.jpg`; el artículo no se
   da por listo sin imagen ni alt.
7. **Datos duros verificados** en fuente oficial (SUNAT/El Peruano/MEF); nada inventado.
