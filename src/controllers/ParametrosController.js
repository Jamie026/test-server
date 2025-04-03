// src/controllers/ParametrosController.js
const AdGroupModel = require('../models/AdGroupModel');
const CampaignModel = require('../models/CampaignModel');
const PortfolioModel = require('../models/PortfolioModel');
const SkuModel = require('../models/SkuModel');
const AsinModel = require('../models/AsinModel');
const ParametroModel = require('../models/ParametroModel');

// Obtener AdGroups con información de campañas
exports.getAdGroups = async (req, res) => {
  try {
    //  AdGroups desde la base de datos
    const adGroups = await AdGroupModel.find()
      .populate('campaign') //  referencia a campaña
      .lean();

    // Transformar los datos para que coincidan con la estructura esperada en el frontend
    const formattedData = adGroups.reduce((acc, adGroup) => {
      //  si existe la campaña en el resultado
      const existingCampaignIndex = acc.findIndex(
        item => item.campana === adGroup.campaign.campaignName
      );

      if (existingCampaignIndex >= 0) {
        // Añadir AdGroup a una campaña existente
        acc[existingCampaignIndex].adGroups.push({
          name: adGroup.adGroupName,
          status: adGroup.state
        });
      } else {
        // Crear una nueva entrada para la campaña
        acc.push({
          campana: adGroup.campaign.campaignName,
          type: adGroup.campaign.sponsoredType || 'SP',
          status: adGroup.campaign.state || 'ENABLED',
          adGroups: [{
            name: adGroup.adGroupName,
            status: adGroup.state
          }]
        });
      }

      return acc;
    }, []);

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo AdGroups:', error);
    res.status(500).json({ error: 'Error obteniendo AdGroups' });
  }
};

// Obtener Campañas con sus AdGroups
exports.getCampaigns = async (req, res) => {
  try {
    // Obtener campañas con sus AdGroups
    const campaigns = await CampaignModel.find()
      .populate('adGroups') 
      .lean();

    // Transformar los datos  con la estructura esperada
    const formattedData = campaigns.map(campaign => ({
      campana: campaign.campaignName,
      type: campaign.sponsoredType || 'SP',
      status: campaign.state || 'ENABLED',
      adGroups: campaign.adGroups.map(adGroup => ({
        name: adGroup.adGroupName,
        status: adGroup.state
      }))
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo Campaigns:', error);
    res.status(500).json({ error: 'Error obteniendo Campaigns' });
  }
};

// Obtener Portfolios con sus campañas y AdGroups
exports.getPortfolios = async (req, res) => {
  try {
    // Obtener portfolios con sus campañas
    const portfolios = await PortfolioModel.find()
      .populate({
        path: 'campaigns',
        populate: {
          path: 'adGroups'
        }
      })
      .lean();

    // Transformar los datos
    const formattedData = portfolios.map(portfolio => ({
      nombre: portfolio.portfolioName,
      status: portfolio.state || 'ENABLED',
      campanas: portfolio.campaigns.map(campaign => ({
        nombre: campaign.campaignName,
        type: campaign.sponsoredType || 'SP',
        status: campaign.state || 'ENABLED',
        adGroups: campaign.adGroups.map(adGroup => ({
          name: adGroup.adGroupName,
          status: adGroup.state
        }))
      }))
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo Portfolios:', error);
    res.status(500).json({ error: 'Error obteniendo Portfolios' });
  }
};

// Obtener SKUs con sus campañas y AdGroups
exports.getSKUs = async (req, res) => {
  try {
    // Obtener SKUs con toda la información relacionada
    const skus = await SkuModel.find()
      .populate({
        path: 'campaigns',
        populate: {
          path: 'adGroups'
        }
      })
      .lean();

    // Transformar los datos
    const formattedData = skus.map(sku => ({
      nombre: sku.sku,
      campanas: sku.campaigns.map(campaign => ({
        nombre: campaign.campaignName,
        type: campaign.sponsoredType || 'SP',
        status: campaign.state || 'ENABLED',
        adGroups: campaign.adGroups.map(adGroup => ({
          name: adGroup.adGroupName,
          status: adGroup.state
        }))
      }))
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo SKUs:', error);
    res.status(500).json({ error: 'Error obteniendo SKUs' });
  }
};

// Obtener ASINs con sus campañas y AdGroups
exports.getASINs = async (req, res) => {
  try {
    // Obtener ASINs con toda la información relacionada
    const asins = await AsinModel.find()
      .populate({
        path: 'campaigns',
        populate: {
          path: 'adGroups'
        }
      })
      .lean();

    // Transformar los datos
    const formattedData = asins.map(asin => ({
      nombre: asin.asin,
      campanas: asin.campaigns.map(campaign => ({
        nombre: campaign.campaignName,
        type: campaign.sponsoredType || 'SP',
        status: campaign.state || 'ENABLED',
        adGroups: campaign.adGroups.map(adGroup => ({
          name: adGroup.adGroupName,
          status: adGroup.state
        }))
      }))
    }));

    res.json(formattedData);
  } catch (error) {
    console.error('Error obteniendo ASINs:', error);
    res.status(500).json({ error: 'Error obteniendo ASINs' });
  }
};

// Guardar parámetros
exports.saveParametros = async (req, res) => {
  try {
    const { seccion, funcion, reglas, seleccionados } = req.body;

    // Crear un nuevo parámetro en la base de datos
    const nuevoParametro = await ParametroModel.create({
      seccion,
      funcion,
      reglas,
      seleccionados,
      fechaCreacion: new Date(),
      usuarioId: req.user?.id || 1 //  autenticación
    });

    res.status(201).json({
      mensaje: 'Parámetro guardado correctamente',
      parametro: nuevoParametro
    });
  } catch (error) {
    console.error('Error guardando parámetro:', error);
    res.status(500).json({ error: 'Error guardando parámetro' });
  }
};