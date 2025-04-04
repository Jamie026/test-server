// src/services/WebSocketService.js
const campaignService = require('../services/CampaignService');
const adGroupsService = require('../services/AdGroupsService');
const portfolioService = require('../services/PortfolioService');
const { productsAdsSP } = require('../services/AdsService')

const socketIo = require('socket.io');

class WebSocketService {
    constructor(server) {
        this.io = socketIo(server); // Usamos el servidor HTTP como base para Socket.IO
        this.clients = new Map(); // Mapa para almacenar clientes conectados
        
        // Configurar la conexión de Socket.IO
        this.io.on('connection', (socket) => {
            console.log('Nuevo cliente conectado:', socket.id);

            // Añadir el cliente a la lista
            this.addClient(socket.id, socket);

            // Escuchar los mensajes del cliente (si es necesario)
            socket.on('message', (message) => {
                console.log('Mensaje recibido del cliente:', message);
                // Maneja el mensaje aquí si es necesario
            });

            // Cuando el cliente se desconecta, lo eliminamos
            socket.on('disconnect', () => {
                console.log('Cliente desconectado:', socket.id);
                this.removeClient(socket.id);
            });

            // Manejo de errores
            socket.on('error', (error) => {
                console.error('Error en Socket.IO:', error);
            });
        });
    }

    // Método para emitir un mensaje a todos los clientes
    broadcastToAll(data) {
        const message = JSON.stringify(data);
        this.io.emit('update', message); // Emite el evento 'update' a todos los clientes
    }

    addClient(id, client) {
        this.clients.set(id, client); // Guardamos el cliente en el mapa
    }

    removeClient(id) {
        this.clients.delete(id); // Eliminamos el cliente del mapa cuando se desconecta
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