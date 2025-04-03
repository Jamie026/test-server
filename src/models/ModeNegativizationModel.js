const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const ModeNegativizationModel = sequelize.define("negativization_mode" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    name : {type: DataTypes.STRING , allowNull: false},
    description : {type: DataTypes.STRING , allowNull: true},
},{ timestamps: false });


module.exports = ModeNegativizationModel;