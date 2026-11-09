# Servidor de artículos (Node.js + Supabase)

Flujo: **Muse escribe el artículo → POST /articulos (con clave interna) → Supabase (Postgres) → la web Astro lee con GET**.

## Endpoints
| Método | Ruta | Quién | Qué devuelve |
|---|---|---|---|
| GET | /salud | público | { estado, modo } |
| GET | /articulos | web Astro | Lista sin contenido (solo PUBLICADO; con x-api-key e ?incluir_borradores=true también borradores) |
| GET | /articulos/:slug | web Astro | Artículo completo con contenido_markdown |
| POST | /articulos | Muse/importador | Inserta o actualiza por slug. Exige header `x-api-key` |

## Base de datos (Supabase, estilo Esquema Roque)
Ejecuta `db/esquema.sql` en el SQL Editor del proyecto Supabase. Crea los schemas
`catalogos` y `contabilidad` (nada en public), la tabla `contabilidad.articulos`
con FK al catálogo `catalogos.categorias`, RLS activado y acceso solo para
service_role / la conexión Postgres del servidor. La web nunca toca la BD directo.

## Puesta en marcha
1. Crea el proyecto gratuito en Supabase y corre `db/esquema.sql`.
2. Copia `.env.example` a `.env`: pega `SUPABASE_DB_URL` (Supabase > Database >
   Connection string) y define `API_KEY_INTERNA`.
3. `npm install` y `npm start` → http://127.0.0.1:3010
4. Para subir los artículos ya escritos: con el servidor corriendo, `npm run importar`.

Sin `SUPABASE_DB_URL` el servidor arranca en **modo archivos** (solo lectura
desde ../articulos/*.json), útil para probar los GET antes de conectar Supabase.
