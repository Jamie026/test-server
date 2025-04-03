// scr/models/ReportModels.js
const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/dbConfig')
//const User = require("7./userModel");
const SponsoredType = require('./SponsoredTypeModel')

//Model
const Report = sequelize.define('search_terms_reports',
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    sponsored_type_id: { type: DataTypes.INTEGER, allowNull: false },
    date: { type: DataTypes.DATE, allowNull: false },
    report_data: { type: DataTypes.JSON, allowNull: true },
    csts_negativized: { type: DataTypes.JSON, allowNull: true },
    ads_accounts_id: { type: DataTypes.INTEGER, allowNull: true },
  },
  { timestamps: true }
)

//Relaciones
SponsoredType.hasMany(Report, { foreignKey: 'sponsored_type_id' })
Report.belongsTo(SponsoredType, { foreignKey: 'sponsored_type_id' })

module.exports = Report
