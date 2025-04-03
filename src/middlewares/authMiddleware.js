// src/milddleware/authMiddleware

const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) throw new AppError('Token de acceso requerido', 401);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) throw new AppError('Token inválido o expirado', 403);
    req.user = decoded;
    next();
  });
};

const checkRole = (allowedRoles) => (req, res, next) => {
  // Verifica que el usuario tenga un rol permitido
  if (!allowedRoles.includes(req.user.roleId)) {
    throw new AppError('Acceso no autorizado para este rol', 403);
  }
  next();
};

module.exports = { authenticateToken, checkRole };