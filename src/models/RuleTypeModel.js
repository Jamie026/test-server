const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const RuleTypeModel = sequelize.define("rule_type" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    name : {type: DataTypes.STRING , allowNull: false},
    description : {type: DataTypes.STRING , allowNull: true},
},{ timestamps: false });


module.exports = RuleTypeModel;