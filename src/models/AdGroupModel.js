const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

const AdGroupModel = sequelize.define("ad_groups", {
  id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
  campaigns_id : {type: DataTypes.INTEGER , allowNull: false},
  sku_id : {type: DataTypes.INTEGER , allowNull: true},
  ad_group_id : {type: DataTypes.STRING , allowNull: false},
  name : {type: DataTypes.STRING , allowNull: false},
  state : {type: DataTypes.STRING , allowNull: false}
},{ timestamps: false });


module.exports = AdGroupModel;