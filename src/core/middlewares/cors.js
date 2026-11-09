// CORS por lista blanca: solo los orígenes declarados en CORS_ORIGENES
// (separados por comas) reciben cabeceras Access-Control; cualquier otro
// origen desconocido se queda sin cabeceras y el navegador le bloquea la
// lectura. Las peticiones sin cabecera Origin (servidor a servidor, como el
// build de Astro, curl o el importador) no son CORS y pasan sin cambios.
const ORIGENES_DEFECTO = ['http://localhost:4321', 'http://127.0.0.1:4321'];

function origenesPermitidos() {
  const lista = (process.env.CORS_ORIGENES || '').split(',').map((o) => o.trim()).filter(Boolean);
  return lista.length ? lista : ORIGENES_DEFECTO;
}

function cors(req, res, next) {
  const origen = req.headers.origin;
  if (!origen) return next();
  res.setHeader('Vary', 'Origin');
  if (!origenesPermitidos().includes(origen)) {
    if (req.method === 'OPTIONS') return res.status(204).end();
    return next();
  }
  res.setHeader('Access-Control-Allow-Origin', origen);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return next();
}

module.exports = { cors };
