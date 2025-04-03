const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

const campaignsBySKU = async () => {
    const results = await sequelize.query(
    "SELECT skus.sku 'sku' ,  campaigns.campaign_id 'campaignId', campaigns.name 'campaignName', "+
    "sponsored_type.name 'sponsoredType', campaigns.state 'campaignState' , ad_groups.ad_group_id 'adGroupId' , "+ 
    "ad_groups.name 'adGroupName', ad_groups.state 'adGroupState' FROM skus "+
    "INNER JOIN ad_groups ON skus.id = ad_groups.sku_id "+
    "INNER JOIN campaigns ON ad_groups.campaigns_id = campaigns.id "+
    "INNER JOIN sponsored_type ON campaigns.sponsored_type_id = sponsored_type.id "+
    "ORDER BY 'sku' , 'campaignState'  , 'adGroupState'");

    //console.log(results[0]);
    return results[0];
}

//campaignsBySKU();

module.exports = {campaignsBySKU};