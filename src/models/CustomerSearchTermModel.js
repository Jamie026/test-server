const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/dbConfig");


const CustomerSearchTermModel = sequelize.define("customer_seach_terms", {
  id : {type: DataTypes.INTEGER , autoIncrement: true , primaryKey: true },
  search_terms_reports_id : {type: DataTypes.INTEGER , allowNull: false},
  ads_accounts_id : {type: DataTypes.INTEGER , allowNull: false},
  sponsored_type_id : {type: DataTypes.INTEGER , allowNull: false},
  segmentation_id : {type: DataTypes.INTEGER , allowNull: true},
  negativization_mode_id : {type: DataTypes.INTEGER , allowNull: false},
  campaign : {type: DataTypes.JSON , allowNull: true},
  ad_group : {type: DataTypes.JSON , allowNull: true},
  campaigns_id : {type: DataTypes.INTEGER , allowNull: true},
  ad_groups_id : {type: DataTypes.INTEGER , allowNull: true},
  targeting : {type: DataTypes.STRING , allowNull: true},
  match_type_id : {type: DataTypes.INTEGER , allowNull: false},
  customer_search_term : {type: DataTypes.STRING , allowNull: true},
  negative_type_id : {type: DataTypes.INTEGER , allowNull: false},
  customer_search_terms_states_id : {type: DataTypes.INTEGER , allowNull: false},
  users_id : {type: DataTypes.INTEGER , allowNull: false},
  destinations : {type: DataTypes.JSON , allowNull: true},
},{ timestamps: true });


module.exports = CustomerSearchTermModel;