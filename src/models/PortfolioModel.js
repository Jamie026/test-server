const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const PortfolioModel = sequelize.define("portfolios" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    portfolio_id : {type: DataTypes.STRING , allowNull: false},
    name : {type: DataTypes.STRING , allowNull: false},
    state : {type: DataTypes.STRING , allowNull: false},
    ads_accounts_id : {type: DataTypes.INTEGER , allowNull: false},
},{ timestamps: false });


module.exports = PortfolioModel;