const { sequelize } = require('../config/dbConfig');

const campaignsAndAdGroups = async () => {
    const results = await sequelize.query(
        `SELECT campaigns.campaign_id AS campaignId, campaigns.name AS campaignName, 
                sponsored_type.name AS sponsoredType, campaigns.state AS campaignState, 
                ad_groups.ad_group_id AS adGroupId, ad_groups.name AS adGroupName, 
                ad_groups.state AS adGroupState 
         FROM ad_groups 
         INNER JOIN campaigns ON ad_groups.campaigns_id = campaigns.id 
         INNER JOIN sponsored_type ON campaigns.sponsored_type_id = sponsored_type.id`
    );

    const rows = results[0];

    const groupedData = rows.reduce((acc, row) => {
        const { campaignId, campaignName, sponsoredType, campaignState, adGroupId, adGroupName, adGroupState } = row;

        if (!acc[campaignId]) {
            acc[campaignId] = {
                campaignId,
                campaignName,
                sponsoredType,
                campaignState,
                adGroups: []
            };
        }

        acc[campaignId].adGroups.push({
            adGroupId,
            adGroupName,
            adGroupState
        });

        return acc;
    }, {});

    return Object.values(groupedData);
};

//campaignsAndAdGroups();

module.exports = {campaignsAndAdGroups};