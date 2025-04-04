const campaignService = require('./CampaignService');
const adGroupsService = require('./AdGroupsService');
const portfolioService = require('./PortfolioService');
const { productsAdsSP } = require('./AdsService');

function mergeCampaignsWithASIN(campaigns, productos){
    return productos.map(producto => ({
        ...producto,
        campaigns: campaigns.filter(campaign => campaign.campaignId === producto.campaignId),
    }));
}

function mergeCampaignsWithPortafolios(portafolios, campaigns) {
    return portafolios.map(portafolio => ({
        ...portafolio,
        campaigns: campaigns.filter(campaign => campaign.portfolioId === portafolio.portfolioId),
    }));
}

function mergeCampaignsWithAdGroups(campaigns, adGroups, type) {
    return campaigns.map(campaign => ({
        ...campaign,
        type: type,
        adGroups: adGroups.filter(adGroup => adGroup.campaignId === campaign.campaignId),
    }));
}

async function getData() {
    const [adGroupsDataSP, adGroupsDataSB, campaignsDataSP, campaignsDataSB, portafoliosData, productosData] = await Promise.all([
        adGroupsService.adGroupsListSP(),
        adGroupsService.adGroupsListSB(),
        campaignService.campaignsListSP(),
        campaignService.campaignsListSB(),
        portfolioService.portfoliosList(),
        productsAdsSP(),
    ]);

    const campaignsMergeSP = mergeCampaignsWithAdGroups(campaignsDataSP.campaigns, adGroupsDataSP.adGroups, "SP");
    const campaignsMergeSB = mergeCampaignsWithAdGroups(campaignsDataSB.campaigns, adGroupsDataSB.adGroups, "SB");

    const campaignsData = [...campaignsMergeSB, ...campaignsMergeSP]
    const adGroupsData = [...adGroupsDataSP.adGroups, ...adGroupsDataSB.adGroups]

    const portafoliosMerge = mergeCampaignsWithPortafolios(portafoliosData.portfolios, campaignsData)
    const productosMerge = mergeCampaignsWithASIN(campaignsData, productosData.productAds)

    return {
        campaigns: campaignsData,
        adgroups: adGroupsData,
        portfolios: portafoliosMerge,
        productos: productosMerge
    }
}

module.exports = { getData };