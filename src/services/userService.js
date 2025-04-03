const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { AppError } = require('../utils/errorHandler');

// Función para registrar un nuevo usuario
const registerUser = async (userData) => {
  // Verificar si el email ya existe
  const existingUser = await User.findOne({ where: { email: userData.email } });
  if (existingUser) throw new AppError('El email ya está registrado', 400);

  // Hashear la contraseña
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  // Crear usuario
  return await User.create({
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email,
    passwordHashed: hashedPassword,
    // Valores por defecto
    userRolesId: 1,
    userStatesId: 1
  });
};

// Función para autenticar al usuario
const authenticateUser = async (email, password) => {
  // Validar configuración JWT
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new AppError('Configuración JWT incompleta', 500);
  }

  // Buscar usuario por email
  const user = await User.findOne({ where: { email } });
  if (!user) throw new AppError('Credenciales inválidas', 401);

  // Comparar la contraseña proporcionada con la almacenada
  const isValid = await bcrypt.compare(password, user.passwordHashed);
  console.log(isValid);
  if (!isValid) throw new AppError('Credenciales inválidas', 401);

  // Generar los tokens JWT
  const accessToken = jwt.sign(
    { userId: user.id, roleId: user.userRolesId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  // Actualizar el refresh token en la base de datos
  await user.update({ refreshToken });

  // Retornar los tokens generados
  return { accessToken, refreshToken };
};

module.exports = { registerUser, authenticateUser };
