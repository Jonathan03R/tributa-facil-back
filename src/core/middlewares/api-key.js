// Middleware de seguridad: exige la clave interna en el header x-api-key.
// Protege la escritura (POST) y el acceso a borradores.
const config = require('../config/env');

const esAdmin = (req) => Boolean(config.apiKeyInterna) && req.get('x-api-key') === config.apiKeyInterna;

const requerirApiKey = (req, res, next) => {
  if (!esAdmin(req)) return res.status(401).json({ error: 'x-api-key inválida o ausente' });
  next();
};

module.exports = { esAdmin, requerirApiKey };
