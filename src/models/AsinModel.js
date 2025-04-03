const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const AsinModel = sequelize.define("asins" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    asin_id : {type: DataTypes.STRING , allowNull: false},
    ads_accounts_id : {type: DataTypes.INTEGER , allowNull: false},
},{ timestamps: false });


module.exports = AsinModel;