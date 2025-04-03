const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbConfig');


const campaignsByPortfolio = async () =>{
    const results = await sequelize.query(
    "SELECT portfolios.name 'portfolioName' , portfolios.state 'portfolioState', "+
    "campaigns.campaign_id 'campaignId', campaigns.name 'campaignName', "+ 
    "sponsored_type.name 'sponsoredType', campaigns.state 'campaignState' , "+ 
    "ad_groups.ad_group_id 'adGroupId', ad_groups.name 'adGroupName', "+ 
    "ad_groups.state 'adGroupState' FROM portfolios "+ 
    "RIGHT JOIN campaigns ON portfolios.id = campaigns.portfolio_id "+
    "INNER JOIN ad_groups ON campaigns.id = ad_groups.campaigns_id "+
    "INNER JOIN sponsored_type ON campaigns.sponsored_type_id = sponsored_type.id "+
    "WHERE portfolios.id is not null "+
    "ORDER BY portfolios.id , 'campaignState'  , 'adGroupState'");

    //console.log(results[0]);
    //Retorna un solo array [ { }, { }, { } ]
    return results[0];
}

//campaignsByPortfolio();

module.exports = {campaignsByPortfolio};