// src/services/WebSocketService.js
const logger = require('../utils/logger');
const campaignService = require('../services/CampaignService');
const adGroupsService = require('../services/AdGroupsService');
const portfolioService = require('../services/PortfolioService');
const { productsAdsSP } = require('../services/AdsService')

class WebSocketService {
    constructor() {
        this.campaignService = campaignService;
        this.adGroupsService = adGroupsService;
        this.portfolioService = portfolioService;
        this.currentData = null;
        this.pollingInterval = 60000;
        this.clients = new Map(); // Map to store WebSocket clients
    }

    async fetchData() {
        try {
            const [campaignsSP, campaignsSB, adGroupsSP, adGroupsSB, portfolios] = await Promise.all([
                this.campaignService.campaignsListSP(),
                this.campaignService.campaignsListSB(),
                this.adGroupsService.adGroupsListSP(),
                this.adGroupsService.adGroupsListSB(),
                this.portfolioService.portfoliosList()
            ]);

            return {
                campaigns: { sp: campaignsSP, sb: campaignsSB },
                adGroups: { sp: adGroupsSP, sb: adGroupsSB },
                portfolios
            };
            
        } catch (error) {
            logger.error(`Error fetching real-time data: ${error.message}`);
            return null;
        }
    }

    async getCurrentData() {
        if (!this.currentData) {
            this.currentData = await this.fetchData();
        }
        return this.currentData;
    }

    startPolling(callback) {
        setInterval(async () => {
            const newData = await this.fetchData();
            if (!newData) return;

            const newDataString = JSON.stringify(newData);
            const currentDataString = JSON.stringify(this.currentData);

            if (newDataString !== currentDataString) {
                logger.info('Datos actualizados detectados');
                this.currentData = newData;
                callback(newData);
                this.broadcastToAll({ type: 'update', data: newData });
            } else {
                logger.debug('No hay cambios en los datos');
            }
        }, this.pollingInterval);
    }

    // Broadcast message to all connected WebSocket clients
    broadcastToAll(data) {
        const message = JSON.stringify(data);
        const WebSocket = require('ws');
        
        this.clients.forEach((client, id) => {
            if (client.readyState === WebSocket.OPEN) {
                try {
                    client.send(message);
                    logger.debug(`Mensaje broadcast enviado a ${id}`);
                } catch (error) {
                    logger.error(`Error enviando mensaje a ${id}: ${error.message}`);
                    // Considerar eliminar clientes con error
                    this.removeClient(id);
                }
            }
        });
    }

    // Method to add a client
    addClient(id, client) {
        this.clients.set(id, client);
        logger.info(`Cliente ${id} añadido, total de clientes: ${this.clients.size}`);
    }

    // Method to remove a client
    removeClient(id) {
        const wasDeleted = this.clients.delete(id);
        if (wasDeleted) {
            logger.info(`Cliente ${id} eliminado, clientes restantes: ${this.clients.size}`);
        }
    }
    
    // Método para notificar sobre cambios en parámetros
    notifyParametersChange(parametersData) {
        this.broadcastToAll({
            type: 'parameters_update',
            data: parametersData,
            timestamp: new Date().toISOString()
        });
    }
    
    // Método para notificar cambios de estado en AdGroups
    notifyAdGroupStatusChange(adGroups) {
        this.broadcastToAll({
            type: 'adgroup_status_update',
            data: adGroups,
            timestamp: new Date().toISOString()
        });
    }
}

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

const instance = new WebSocketService();
module.exports = { instance, getData };