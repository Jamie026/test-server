const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const User = sequelize.define('User', {
  firstName: {
    type: DataTypes.STRING(70),
    allowNull: false,
    field: 'first_name' // Mapeo a snake_case
  },
  lastName: {
    type: DataTypes.STRING(70),
    allowNull: false,
    field: 'last_name'
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  passwordHashed: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hashed'
  },
  userRolesId: {
    type: DataTypes.INTEGER,
    field: 'user_roles_id',
    defaultValue: 1
  },
  userStatesId: {
    type: DataTypes.INTEGER,
    field: 'user_states_id',
    defaultValue: 1
  },
  refreshToken: {
    type: DataTypes.STRING(255),
    field: 'refresh_token',
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true // Habilita mapeo automático snake_case
});

module.exports = User;