const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig");

const CampaignModel = sequelize.define("campaigns", {
  id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
  ads_accounts_id : {type: DataTypes.INTEGER , allowNull: false},
  portfolio_id : {type: DataTypes.INTEGER , allowNull: true},
  sponsored_type_id : {type: DataTypes.INTEGER , allowNull: false},
  campaign_id : {type: DataTypes.STRING , allowNull: false},
  name : {type: DataTypes.STRING , allowNull: false},
  state : {type: DataTypes.STRING , allowNull: false},
},{ timestamps: false });

module.exports = CampaignModel;