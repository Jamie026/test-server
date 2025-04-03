//src/middleware/loggerMiddware.js
const Log = require('../models/logModel');

const activityLogger = async (req, res, next) => {
  const action = `${req.method} ${req.path}`;
  const userId = req.user ? req.user.userId : null;

  // No bloquear la respuesta esperando el log
  next();

  try {
    await Log.create({ action, userId, details: JSON.stringify(req.body) });
  } catch (error) {
    console.error("Error al guardar el log:", error);
  }
};

module.exports = activityLogger;