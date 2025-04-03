const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');

//adGroupName
const insertionQuery = async (adGroupName) =>{
    //console.log(adGroupName);
    const results = await sequelize.query(
        "SELECT asins.asin_id 'asin', skus.sku 'sku', "+
        "portfolios.portfolio_id 'portfolioId', portfolios.name 'portfolioName', "+
        "campaigns.campaign_id 'campaignId', campaigns.name 'campaignName', "+
        "ad_groups.ad_group_id 'adGroupId', ad_groups.name 'adGroupName' FROM ad_groups "+
        "INNER JOIN campaigns ON ad_groups.campaigns_id = campaigns.id "+
        "LEFT JOIN portfolios ON campaigns.portfolio_id = portfolios.id "+
        "INNER JOIN skus ON ad_groups.sku_id = skus.id "+
        "INNER JOIN asins ON skus.asin_id = asins.id "+
        "WHERE ad_groups.name = ? ",
        {
            replacements:[adGroupName],
            type: sequelize.QueryTypes.SELECT
        });

    //console.log(results);
    //Retorna doble array [ [ { }, { }, { } ] ]
    return results;
}

//insertionQuery("Azul Rosada - PT Next 6");


module.exports = {insertionQuery};