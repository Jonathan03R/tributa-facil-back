// Infraestructura: cliente de Supabase por API (REST) usando la llave secreta (service role).
// Nada de cadena de conexión: las llaves van en el .env (SUPABASE_URL + SUPABASE_SECRET_KEY).
// La llave secreta salta el RLS, por eso SOLO vive en este servidor, jamás en la web ni en git.
// Si no hay llaves, exporta null y el sistema trabaja en modo archivos.
const { createClient } = require('@supabase/supabase-js');
const config = require('../config/env');

const supabase = config.supabaseUrl && config.supabaseSecretKey
  ? createClient(config.supabaseUrl, config.supabaseSecretKey, { auth: { persistSession: false } })
  : null;

module.exports = { supabase, conBD: Boolean(supabase) };
