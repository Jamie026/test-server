const Portfolio = require('../models/PortfolioModel')
const { campaignsListSP, campaignsListSB } = require('../services/CampaignService')
const Campaign = require('./../models/campaignModel')
const { campaignsByPortfolio } = require('../database/PortfolioQuery')
const { campaignsAndAdGroups } = require('../database/AdGroupQuery')
const { portfoliosList } = require("../services/PortfolioService");

const getCampaigns = async (req, res) => {
    try {
        const campaigns = await Campaign.findAll()

        if (campaigns) {
            res.status(200).json({ campaigns: campaigns })
        } else {
            res.status(404).json({ msg: 'no se encontraron campañas disponibles' })
        }
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const saveCampaignsSP = async (req, res) => {
    try {
        const portfolios = await Portfolio.findAll()

        const jsonData = await campaignsListSP()

        const filteredCampaigns = jsonData.campaigns
            .filter((item) => item.state === 'ENABLED' || item.state === 'PAUSED')
            .map((item) => ({
                ads_accounts_id: 2,
                portfolio_id: item.portfolioId || null,
                sponsored_type_id: 1,
                campaign_id: item.campaignId,
                name: item.name,
                state: item.state,
                ads_accounts_id: 2,
            }))

        // Ordenar primero "ENABLED" y luego "PAUSED"
        const sortedCampaigns = filteredCampaigns.sort((a, b) => {
            if (a.state === 'ENABLED' && b.state === 'PAUSED') return -1
            if (a.state === 'PAUSED' && b.state === 'ENABLED') return 1
            return 0
        })

        const finalCampaigns = sortedCampaigns.map((c) => {
            const matchedPortfolio = portfolios.find((p) => {
                //console.log("Comparando:", p.portfolio_id, "con", c.portfolio_id);  // Verificación
                return String(p.portfolio_id).trim() === String(c.portfolio_id).trim()
            })

            return {
                ads_accounts_id: 2,
                portfolio_id: matchedPortfolio ? matchedPortfolio.id : null,
                sponsored_type_id: 1,
                campaign_id: c.campaign_id,
                name: c.name,
                state: c.state,
            }
        })

        /*finalCampaigns.forEach((item) => {
              Campaign.create(item);
            });*/

        res.status(200).json(finalCampaigns)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const saveCampaignsSB = async (req, res) => {
    try {
        const portfolios = await Portfolio.findAll()

        const jsonData = await campaignsListSB()

        const filteredCampaigns = jsonData.campaigns
            .filter((item) => item.state === 'ENABLED' || item.state === 'PAUSED')
            .map((item) => ({
                ads_accounts_id: 2,
                portfolio_id: item.portfolioId || null,
                sponsored_type_id: 2,
                campaign_id: item.campaignId,
                name: item.name,
                state: item.state,
                ads_accounts_id: 2,
            }))

        // Ordenar primero "ENABLED" y luego "PAUSED"
        const sortedCampaigns = filteredCampaigns.sort((a, b) => {
            if (a.state === 'ENABLED' && b.state === 'PAUSED') return -1
            if (a.state === 'PAUSED' && b.state === 'ENABLED') return 1
            return 0
        })

        const finalCampaigns = sortedCampaigns.map((c) => {
            const matchedPortfolio = portfolios.find((p) => {
                //console.log("Comparando:", p.portfolio_id, "con", c.portfolio_id);  // Verificación
                return String(p.portfolio_id).trim() === String(c.portfolio_id).trim()
            })

            return {
                ads_accounts_id: 2,
                portfolio_id: matchedPortfolio ? matchedPortfolio.id : null,
                sponsored_type_id: 2,
                campaign_id: c.campaign_id,
                name: c.name,
                state: c.state,
            }
        })

        /*finalCampaigns.forEach((item) => {
              Campaign.create(item);
            });*/

        res.status(200).json(finalCampaigns)
    } catch (error) {
        res.status(500).json({ msg: error.message })
    }
}

const fetchCurrentCampaignsByRespectivePortfolio = async (portfolioId, searchTerm) => {
    try {

        const campaignsList = await campaignsListSP()

        const filteredCampaigns = campaignsList.campaigns
            .filter(item => (Object.hasOwn(item, "portfolioId") && item.portfolioId === portfolioId)
                && (item.state === 'ENABLED' || item.state === 'PAUSED'))
            .map(item => ({
                portfolioId: item.portfolioId,
                campaignId: item.campaignId,
                state: item.state,
                keywordText: searchTerm,
                matchType: "NEGATIVE_EXACT"
            }));

        return filteredCampaigns;
        //res.status(200).json(finalCampaigns)
    } catch (error) {
        console.error("Ocurrió un error al procesar las campañas SP por portafolio: ", error.message);
        //res.status(500).json({ msg: error.message })
    }
}

const fetchAllCurrentCampaignsByPortfolio = async (searchTerm) => {
    try {
        const portafoliosList = await portfoliosList();

        const filteredPortfolios = portafoliosList.portfolios
            .filter(item => item.state === "ENABLED")
            .map(item => ({
                portfolioId: item.portfolioId,
                state: item.state
            }));


        const campaignsList = await campaignsListSP()

        const filteredCampaigns = campaignsList.campaigns
            .filter(item => (Object.hasOwn(item, "portfolioId")) && (item.state === 'ENABLED' || item.state === 'PAUSED'))
            .map(item => ({
                portfolioId: item.portfolioId,
                campaignId: item.campaignId,
                state: item.state
            }));

        const finalCampaigns = filteredCampaigns.map((c) => {
            const matchedPortfolio = filteredPortfolios.find((p) => {
                return String(p.portfolioId).trim() === String(c.portfolioId).trim()
            })

            return {
                campaignId: c.campaignId,
                state: c.state,
                keywordText: searchTerm,
                matchType: "NEGATIVE_EXACT"
            }
        });


        return finalCampaigns;
        //res.status(200).json(finalCampaigns)
    } catch (error) {
        console.error("Ocurrió un error al procesar las campañas SP por portafolio: ", error.message);
        //res.status(500).json({ msg: error.message })
    }
}

const getCampaignsByPortfolio = async (req, res) => {
    try {
        const data = await campaignsByPortfolio()
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' })
    }
}

const getCampaignsByGroup = async (req, res) => {
    try {
        const data = await campaignsAndAdGroups()
        return res.status(200).json({ success: true, data })
    } catch (error) {
        console.error('Error fetching campaigns:', error)
        return res
            .status(500)
            .json({ success: false, message: 'Internal Server Error' })
    }
}

module.exports = {
    getCampaigns,
    saveCampaignsSP,
    saveCampaignsSB,
    getCampaignsByPortfolio,
    getCampaignsByGroup,
    fetchCurrentCampaignsByRespectivePortfolio,
    fetchAllCurrentCampaignsByPortfolio
}
