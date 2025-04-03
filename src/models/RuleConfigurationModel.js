const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//Model
const RuleConfigurationModel = sequelize.define("rule_configurations" , {
    id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
    name : {type: DataTypes.STRING , allowNull: false},
    rule_type_id : {type: DataTypes.INTEGER , allowNull: false},
},{ timestamps: false });


module.exports = RuleConfigurationModel;