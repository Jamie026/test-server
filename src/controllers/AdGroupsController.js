const SKU = require("../models/SkuModel");
const Campaign = require("../models/CampaignModel");
const { adGroupsListSP , adGroupsListSB} = require("../services/AdGroupsService");
const { productsAdsSP } = require("../services/AdsService");

const saveAdGroupsSP = async (req,res) => {

    try {
  
      const campaignsSP = await Campaign.findAll({where:{sponsored_type_id:1}});
  
      const jsonData = await adGroupsListSP();

      const productAdsSP = await productsAdsSP();

      const skuList = await SKU.findAll();

      const filteredProductAdsSP = productAdsSP.productAds
        .filter(item => item.state === "ENABLED" || item.state === "PAUSED")
        .map(item => ({
        campaigns_id: item.campaignId,
        sku_id : item.sku,
        ad_group_id: item.adGroupId,
        state: item.state
      }));
  

      const filteredAdGroupsSP = jsonData.adGroups
        .filter(item => item.state === "ENABLED" || item.state === "PAUSED")
        .map(item => ({
        campaigns_id : item.campaignId,
        ad_group_id: item.adGroupId,
        name: item.name,
        state: item.state
      }));

      // Ordenar primero "ENABLED" y luego "PAUSED"
      const sortedAdGroupsSP = filteredAdGroupsSP.sort((a, b) => {
        if (a.state === "ENABLED" && b.state === "PAUSED") return -1;
        if (a.state === "PAUSED" && b.state === "ENABLED") return 1;
        return 0;
      });

      const sortedProductAdsSP = filteredProductAdsSP.sort((a, b) => {
        if (a.state === "ENABLED" && b.state === "PAUSED") return -1;
        if (a.state === "PAUSED" && b.state === "ENABLED") return 1;
        return 0;
      });
  

      const finalProductAdsSP = sortedProductAdsSP.map(c => {
        const matchedSKU = skuList.find(p => {
          //console.log("Comparando:", p.campaign_id, "con", c.campaign_id);  // Verificación
          return String(p.sku).trim() === String(c.sku_id).trim();
        });
      
        return {
          campaigns_id : c.campaigns_id,
          sku_id : matchedSKU ? matchedSKU.id : null,
          ad_group_id: c.ad_group_id,
          state: c.state
        };
      });

      // Convertir json2 en un mapa basado en "ad_group_id" para búsqueda rápida
      const adGroupMap = new Map(sortedAdGroupsSP.map(item => [item.ad_group_id, item.name]));

      // Agregar "name" en la posición correcta en json1 y eliminar los que tienen sku_id null
      const filteredJson = finalProductAdsSP
          .map(item => ({
              campaigns_id: item.campaigns_id,
              sku_id: item.sku_id,
              ad_group_id: item.ad_group_id,
              name: adGroupMap.get(item.ad_group_id) || null,
              state: item.state
          }))
          .filter(item => item.sku_id !== null)  // Elimina los objetos con sku_id: null
          //.sort((a, b) => a.ad_group_id.localeCompare(b.ad_group_id));  // Ordena por ad_group_id
          .sort((a, b) => a.ad_group_id.localeCompare(b.ad_group_id) || a.sku_id - b.sku_id);  // Ordena por ad_group_id y luego por sku_id

      
      const finalAdGroupsSP = filteredJson.map(c => {
        const matchedCampaign = campaignsSP.find(p => {
          //console.log("Comparando:", p.campaign_id, "con", c.campaign_id);  // Verificación
          return String(p.campaign_id).trim() === String(c.campaigns_id).trim();
        });
      
        return {
          campaigns_id : matchedCampaign ? matchedCampaign.id : null,
          sku_id : c.sku_id,
          ad_group_id: c.ad_group_id,
          name: c.name,
          state: c.state
        };
      });
      
      /*finalAdGroupsSP.forEach((item) => {
        AdGroup.create(item);
      });*/

      //res.status(200).json(finalAdGroupsSP);
      res.status(200).json(finalAdGroupsSP);
     
    } catch (error){
        res.status(500).json({"msg":error.message});
    }
  
}

const saveAdGroupsSB = async (req,res) => {
  
  try {

    const campaignsSP = await Campaign.findAll({where:{sponsored_type_id:2}});

    const jsonData = await adGroupsListSB();

    const productAdsSP = await productsAdsSP();

    const skuList = await SKU.findAll();

    const filteredProductAdsSP = productAdsSP.productAds
      .filter(item => item.state === "ENABLED" || item.state === "PAUSED")
      .map(item => ({
      campaigns_id: item.campaignId,
      sku_id : item.sku,
      ad_group_id: item.adGroupId,
      state: item.state
    }));


    const filteredAdGroupsSP = jsonData.adGroups
      .filter(item => item.state === "ENABLED" || item.state === "PAUSED")
      .map(item => ({
      campaigns_id : item.campaignId,
      ad_group_id: item.adGroupId,
      name: item.name,
      state: item.state
    }));

    // Ordenar primero "ENABLED" y luego "PAUSED"
    const sortedAdGroupsSP = filteredAdGroupsSP.sort((a, b) => {
      if (a.state === "ENABLED" && b.state === "PAUSED") return -1;
      if (a.state === "PAUSED" && b.state === "ENABLED") return 1;
      return 0;
    });

    const sortedProductAdsSP = filteredProductAdsSP.sort((a, b) => {
      if (a.state === "ENABLED" && b.state === "PAUSED") return -1;
      if (a.state === "PAUSED" && b.state === "ENABLED") return 1;
      return 0;
    });


    const finalProductAdsSP = sortedProductAdsSP.map(c => {
      const matchedSKU = skuList.find(p => {
        //console.log("Comparando:", p.campaign_id, "con", c.campaign_id);  // Verificación
        return String(p.sku).trim() === String(c.sku_id).trim();
      });
    
      return {
        campaigns_id : c.campaigns_id,
        sku_id : matchedSKU ? matchedSKU.id : null,
        ad_group_id: c.ad_group_id,
        state: c.state
      };
    });

    // Convertir json2 en un mapa basado en "ad_group_id" para búsqueda rápida
    const adGroupMap = new Map(sortedAdGroupsSP.map(item => [item.ad_group_id, item.name]));

    // Agregar "name" en la posición correcta en json1 y eliminar los que tienen sku_id null
    const filteredJson = finalProductAdsSP
        .map(item => ({
            campaigns_id: item.campaigns_id,
            sku_id: item.sku_id,
            ad_group_id: item.ad_group_id,
            name: adGroupMap.get(item.ad_group_id) || null,
            state: item.state
        }))
        .filter(item => item.sku_id !== null)  // Elimina los objetos con sku_id: null
        //.sort((a, b) => a.ad_group_id.localeCompare(b.ad_group_id));  // Ordena por ad_group_id
        .sort((a, b) => a.ad_group_id.localeCompare(b.ad_group_id) || a.sku_id - b.sku_id);  // Ordena por ad_group_id y luego por sku_id

    
    const finalAdGroupsSP = filteredJson.map(c => {
      const matchedCampaign = campaignsSP.find(p => {
        //console.log("Comparando:", p.campaign_id, "con", c.campaign_id);  // Verificación
        return String(p.campaign_id).trim() === String(c.campaigns_id).trim();
      });
    
      return {
        campaigns_id : matchedCampaign ? matchedCampaign.id : null,
        sku_id : c.sku_id,
        ad_group_id: c.ad_group_id,
        name: c.name,
        state: c.state
      };
    });
    
    /*finalAdGroupsSP.forEach((item) => {
      AdGroup.create(item);
    });*/

    //res.status(200).json(finalAdGroupsSP);
    res.status(200).json(finalAdGroupsSP);
   
  } catch (error){
      res.status(500).json({"msg":error.message});
  }

}


module.exports = { saveAdGroupsSP , saveAdGroupsSB }; 
