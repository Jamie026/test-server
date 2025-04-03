const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const SkuModel = sequelize.define("skus" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    sku : {type: DataTypes.STRING , allowNull: false},
    asin_id : {type: DataTypes.INTEGER , allowNull: false},
},{ timestamps: false });


module.exports = SkuModel;