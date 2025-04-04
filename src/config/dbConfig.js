const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: 3306,
        define: {
            underscored: true // Forzar snake_case en la BD
        }
    }
);

module.exports = { sequelize };