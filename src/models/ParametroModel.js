const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig");


const ParametroModel = sequelize.define("parameters", {
  
  id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
  segmentation_id : {type: DataTypes.INTEGER , allowNull: true},
  name : {type: DataTypes.STRING , allowNull: true},
  destination_id : {type: DataTypes.INTEGER , allowNull: false},
  rules : {type: DataTypes.JSON , allowNull: true},
  destinations : {type: DataTypes.JSON , allowNull: true},
  ads_accounts_id : {type: DataTypes.INTEGER , allowNull: false},
  users_id : {type: DataTypes.INTEGER , allowNull: false}
},{ timestamps: true });


module.exports = ParametroModel;