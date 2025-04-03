const User = require("../models/userModel");
const { AppError } = require('../utils/errorHandler');
const userService = require('../services/userService');
const { validatePassword, validateEmail } = require('../utils/validators');


const register = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;

        if (!validateEmail(email)) throw new AppError('Formato de email inválido', 400);
        if (!validatePassword(password)) throw new AppError('Contraseña débil', 400);

        const newUser = await userService.registerUser({
            firstName,
            lastName,
            email,
            password
        });

        res.status(201).json({ userId: newUser.id });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const tokens = await userService.authenticateUser(email, password);
        res.json(tokens);
    } catch (error) {
        next(error);
    }
};

const refreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        const newAccessToken = await userService.refreshAccessToken(refreshToken);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        next(error);
    }
};

const getCurrentUser = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: id = req.user.userId });
        res.json(user);
    } catch (error) {
        next(error);
    }
};

// controllers/userController.js
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'user_roles_id']
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener usuarios: " + error.message });
    }
};

module.exports = { register, login, refreshToken, getCurrentUser };