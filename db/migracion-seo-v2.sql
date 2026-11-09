-- Migración SEO v2: H1 propio, imagen destacada y palabras clave secundarias.
-- Esquema Roque: columnas con prefijo de la entidad (articulo_).
alter table contabilidad.articulos add column if not exists articulo_h1 text;
alter table contabilidad.articulos add column if not exists articulo_imagen_url text;
alter table contabilidad.articulos add column if not exists articulo_imagen_alt text;
alter table contabilidad.articulos add column if not exists articulo_imagen_credito text;
alter table contabilidad.articulos add column if not exists articulo_palabras_clave_secundarias jsonb not null default '[]'::jsonb;
