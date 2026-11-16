# ⚠️ OBSOLETO — Este backend ya no se usa (desde el 2026-11-16)

Por decisión de Jona, Tributa Bien eliminó este intermediario:

- **La web lee directo de Supabase**: vistas públicas `public.articulos_web` y `public.categorias_web` (solo artículos PUBLICADO), consultadas con la llave publishable. La web ya no llama a este backend.
- **La publicación de artículos** la hace la tarea automática horaria directo contra la API REST de Supabase, replicando la validación y la lógica que tenía este servicio (incluida la asignación manual de IDs).
- El servicio de Render asociado a este repo fue apagado.

Este repositorio queda solo como referencia histórica. No desplegar ni usar sus endpoints: nadie los consume.

---

# Tributa Fácil — Backend de artículos (Node.js + Supabase)

Flujo: **Muse escribe el artículo → POST /articulos (con clave interna) → Supabase (Postgres) → la web Astro lee con GET**.

## Arquitectura (misma organización que backend_sunaap)

```
src/
  server.js               Entrada: solo levanta la app
  app.js                  Crea Express y monta todo
  app-module-routes.js    Monta las rutas de los módulos
  core/
    config/env.js         Único lugar que lee el .env
    infraestructura/db.js Pool de conexión a Supabase (pg)
    middlewares/          api-key.js (protege escritura y borradores)
  modules/
    articulos/
      articulos.routes.js     GET /, GET /:slug, POST /
      controllers/            HTTP <-> servicio (sin lógica ni SQL)
      services/               Reglas de negocio
      repositories/           Único acceso a datos (SQL o archivos)
      schemas/                Contrato del artículo y validación
db/esquema.sql            Esquema Supabase (estilo Esquema Roque)
scripts/importar-articulos.js  Importador que usa Muse (POST vía el servidor)
docs/PARAMETROS-WEB.md    Contrato de parámetros que consume la web
```

## Endpoints
| Método | Ruta | Quién | Qué devuelve |
|---|---|---|---|
| GET | /salud | público | { estado, modo } |
| GET | /articulos | web Astro | Lista sin contenido (solo PUBLICADO; con x-api-key e ?incluir_borradores=true también borradores) |
| GET | /articulos/:slug | web Astro | Artículo completo con contenido_markdown |
| GET | /categorias | web Astro | Catálogo de categorías con total de publicados por categoría |
| GET | /articulos?categoria=SUNAT | web Astro | Lista filtrada por categoría |
| POST | /articulos | Muse/importador | Inserta o actualiza por slug. Exige header `x-api-key` |

## Base de datos (Supabase, estilo Esquema Roque)
Ejecuta `db/esquema.sql` en el SQL Editor del proyecto Supabase. Crea los schemas
`catalogos` y `contabilidad` (nada en public), la tabla `contabilidad.articulos`
con FK al catálogo `catalogos.categorias`, RLS activado y acceso solo para
service_role / la conexión Postgres del servidor. La web nunca toca la BD directo.

## Puesta en marcha
1. Proyecto en Supabase + correr `db/esquema.sql`.
2. Copia `.env.example` a `.env`: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` (API de Supabase, sin cadena de conexión) y `API_KEY_INTERNA`.
3. `npm install` y `npm start` → http://127.0.0.1:3010
4. Subir los artículos ya escritos: con el servidor corriendo, `npm run importar`.

Sin llaves de Supabase el servidor arranca en **modo archivos** (solo lectura
desde ../articulos/*.json), útil para probar los GET sin BD.
