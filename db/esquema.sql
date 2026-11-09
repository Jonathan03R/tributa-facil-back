-- Esquema Roque — Blog de contabilidad (artículos desde noticias)
-- Dominio: contabilidad (artículos) + catalogos (categorías)
-- Acceso: SOLO backend Node.js (service_role / conexión Postgres del servidor).
-- El frontend/Astro NUNCA toca la BD directo: consume el endpoint del servidor.

create schema if not exists catalogos;
create schema if not exists contabilidad;

revoke all on schema catalogos from anon, authenticated;
revoke all on schema contabilidad from anon, authenticated;
grant usage on schema catalogos to service_role;
grant usage on schema contabilidad to service_role;

-- ── Catálogo: categorías de artículos ─────────────────────────────
create table if not exists catalogos.categorias (
  categoria_id bigserial primary key,
  categoria_codigo text not null unique,
  categoria_nombre text not null,
  categoria_descripcion text,
  creado_por bigint,
  actualizado_por bigint,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  activo boolean not null default true
);
alter table catalogos.categorias enable row level security;
revoke all on table catalogos.categorias from anon, authenticated;
grant select, insert, update, delete on table catalogos.categorias to service_role;

insert into catalogos.categorias (categoria_codigo, categoria_nombre) values
  ('SUNAT','SUNAT'), ('TRIBUTARIO','Tributario'), ('IGV','IGV'), ('RENTA','Renta'),
  ('PLANILLAS','Planillas'), ('COMPROBANTES','Comprobantes Electrónicos'),
  ('CONTABILIDAD','Contabilidad')
on conflict (categoria_codigo) do nothing;

-- ── Operacional: artículos ────────────────────────────────────────
create table if not exists contabilidad.articulos (
  articulo_id bigserial primary key,
  categoria_id bigint not null references catalogos.categorias(categoria_id),

  articulo_titulo text not null,
  articulo_slug text not null,
  articulo_descripcion text,
  articulo_resumen text,
  articulo_etiquetas text[] not null default '{}',
  articulo_palabra_clave text,
  articulo_fecha_publicacion date not null default current_date,
  articulo_autor text not null default 'Jonathan Roque',
  articulo_fuente_nombre text,
  articulo_fuente_url text,
  articulo_norma_relacionada text,
  articulo_vigencia text,
  articulo_tiempo_lectura_min integer not null default 4
    constraint articulos_tiempo_lectura_check check (articulo_tiempo_lectura_min > 0),
  articulo_estado text not null default 'BORRADOR'
    constraint articulos_estado_check check (articulo_estado in ('BORRADOR','PUBLICADO','ARCHIVADO')),
  articulo_contenido_markdown text not null,
  articulo_metadata jsonb not null default '{}'::jsonb,

  creado_por uuid,
  actualizado_por uuid,
  fecha_creacion timestamptz not null default now(),
  fecha_actualizacion timestamptz not null default now(),
  activo boolean not null default true
);

create unique index if not exists uq_articulos_slug
  on contabilidad.articulos (articulo_slug) where activo = true;
create index if not exists idx_articulos_estado_fecha
  on contabilidad.articulos (articulo_estado, articulo_fecha_publicacion desc) where activo = true;
create index if not exists idx_articulos_categoria
  on contabilidad.articulos (categoria_id) where activo = true;

alter table contabilidad.articulos enable row level security;
revoke all on table contabilidad.articulos from anon, authenticated;
grant select, insert, update, delete on table contabilidad.articulos to service_role;

-- Las secuencias de los IDs (bigserial) también necesitan permiso: sin esto,
-- los INSERT nuevos fallan con "permission denied for sequence".
grant usage, select on all sequences in schema catalogos to service_role;
grant usage, select on all sequences in schema contabilidad to service_role;

-- ===== API (PostgREST) =====
-- Para que las llaves (publishable/secret) puedan llegar a estos schemas vía API,
-- deben estar expuestos en PostgREST (equivalente a Settings > API > Exposed schemas):
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, catalogos, contabilidad';
notify pgrst, 'reload schema';
