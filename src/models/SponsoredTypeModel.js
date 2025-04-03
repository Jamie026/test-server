const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/dbConfig')

//Model
const SponsoredType = sequelize.define(
  'sponsored_type',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
  },
  { timestamps: false, tableName: 'sponsored_type' }
)

module.exports = SponsoredType
