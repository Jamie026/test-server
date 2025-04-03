//const CustomerSearchTerm = require("../models/CustomerSearchTermModel");
const { spNegativization , sbNegativization , spCampaignsNegativization } = require("../services/NegativizationService");
const { portfoliosList } = require("../services/PortfolioService");
const { campaignsListSP } = require("../services/CampaignService");
const { adGroupsListSP, adGroupsListSB } = require("../services/AdGroupsService");
const CustomerSearchTermModel = require("../models/CustomerSearchTermModel");

//Negativización por AdGroup

const process_Respective_AdGroup = async (searchTerms) =>{
  try{

    const spCSTs = [];
    const sbCSTs = [];

    searchTerms.forEach(item => {
      if(item.type === "Sponsored Products"){
        let spCST = {
          campaignId : item.campaignId,
          adGroupId: item.adGroupId,
          keywordText : item.cst,
          state: "ENABLED",
          matchType : "NEGATIVE_EXACT"
        }
        spCSTs.push(spCST); 
      } else if (item.type === "Sponsored Brands"){
          let sbCST = {
            campaignId : item.campaignId,
            adGroupId : item.adGroupId,
            keywordText : item.cst,
            matchType : "negativeExact"
          }
          sbCSTs.push(sbCST);
      }
    });

    //Arrays por si se superan los limites de 1000 para SP y 100 para SB
    const spCSTs2 = [];
    const sbCSTs2 = [];

    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){

        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
       
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para las Campañas Seleccionadas:", error.message);
  }
} 


const negativization_CSTs_By_Respective_Adgroup = async (req, res) => {
    try{

      const searchTerms = req.body;

      const cstJSON = await process_Respective_AdGroup(searchTerms);

      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_byAdgroup(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

      if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }

      
      searchTerms.forEach(async (item) => {
          let body = {
            search_terms_reports_id: 1,
            ads_accounts_id: 2,
            sponsored_type_id: item.type === "Sponsored Products" ? 1 : 2,
            segmentation_id: null,
            negativization_mode_id: 1,
            campaign: item.campaign,
            ad_group: item.ad_group,
            campaigns_id: 1,
            ad_groups_id: 1,
            targeting : item.targeting,
            match_type_id: item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
            customer_search_term: item.cst,
            negative_type_id : 1,
            customer_search_terms_states_id : 1,
            users_id: 1 ,
            destinations: null
          }

          await CustomerSearchTermModel.create(body);  
      });

      console.log("Negativización por Adgroup Respectivo - Completada");
      res.status(200).json({"msg":"Negativización por Adgroup Respectivo - Completada"});

    }catch(error){
      console.error("Ocurrió un Error al Negativizar los CSTs por AdGroup Respectivo:", error.message);
      res.status(500).json({"error": error.message });
    }
};

const negativize_SP_CSTs_byAdgroup = async (bodySP) => {
  try {
    const responseStatus = await spNegativization(bodySP);
    return responseStatus;
  } catch (error) {
    console.error("Ocurrió un Error al Negativizar los SP CSTs por AdGroup:", error.message);
  }
};

const negativize_SB_CSTs_byAdgroup = async (bodySB) => {
  try {
    const responseStatus = await sbNegativization(bodySB);
    return responseStatus;
  } catch (error) {
    console.error("Ocurrió un Error al Negativizar los SB CSTs por AdGroup:", error.message);
  }
};

const process_All_AdGroups = async (searchTerm) =>{
  try{

    const body = {
      "stateFilter": {
        "include": [
          "ENABLED", "PAUSED"
        ]
      }
    }

    const spCSTs = [];
    const sbCSTs = [];

    const response = await adGroupsListSP(body);
    const response2 = await adGroupsListSB(body);

    if(response){
      const spAdGroups = response.adGroups;

      if(spAdGroups.length!==0){
        spAdGroups.forEach((ag) => {
          let spCST = {
            campaignId: ag.campaignId,
            adGroupId: ag.adGroupId,
            state: "ENABLED",
            keywordText: searchTerm,
            matchType: "NEGATIVE_EXACT"
          }
          spCSTs.push(spCST);
        });
      }else{
        console.log("No hay AdGroups SP disponibles para Negativizar");
      }
    }else{
      console.log("Error al Obtener los AdGroups SP");
    }
      

    if(response2){
      const sbAdgroups = response2.adGroups;

      if(sbAdgroups.length!==0){
        sbAdgroups.forEach((ag) => {
          let sbCST = {
            campaignId: ag.campaignId,
            adGroupId: ag.adGroupId,
            keywordText: searchTerm,
            matchType: "negativeExact"
          }
          sbCSTs.push(sbCST);
        });
      }else{
        console.log("No hay AdGroups SB disponibles para Negativizar");
      }
    }else{
      console.log("Error al Obtener los AdGroups SB");
    }
      

    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){

        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
      
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para Todos los AdGroups:", error.message);
  }
}


const negativize_CSTs_All_AdGroups = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_All_AdGroups(item.cst);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_byAdgroup(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else if (cstJSON.spCSTs.length>1){
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

      if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else if (cstJSON.sbCSTs.length>1){
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }

    }

    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 2,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: null
      }
      await CustomerSearchTermModel.create(body);
    });

    console.log("Negativización para Todos los Adgroups - Completada");
    res.status(200).json({"msg":"Negativización para Todos los Adgroups - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para Todos los AdGroups:", error.message);
    res.status(500).json({"error": error.message });
  }
}

const process_Select_AdGroups = async (cst , destinations) =>{
  try{

    const spCSTs = [];
    const sbCSTs = [];

    destinations.campaigns.forEach((c) => {
      if(c.type === "SP"){
        if(c.adGroups.length!==0){
          c.adGroups.forEach((ag)=>{
            let spCST = {
              campaignId: c.campaignId,
              adGroupId: ag.adGroupId,
              state: "ENABLED",
              keywordText: cst,
              matchType: "NEGATIVE_EXACT"
            }
            spCSTs.push(spCST);
          });
        }else{
          console.log("Campaña SP sin AdGroups para poder Negativizar");
        }
      } else if (c.type === "SB"){
          if(c.adGroups.length!==0){
            c.adGroups.forEach((ag)=>{
              let sbCST = {
                campaignId: c.campaignId,
                adGroupId: ag.adGroupId,
                keywordText: cst,
                matchType: "negativeExact"
              }
              sbCSTs.push(sbCST);
            });
          }else{
            console.log("Campaña SB sin AdGroups para poder Negativizar");
          }
      }
    });

    //Arrays por si se superan los limites de 1000 para SP y 100 para SB
    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){

        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
       
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para los AdGroups Seleccionados:", error.message);
  }
} 

const negativization_CSTs_By_Select_Adgroups = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Select_AdGroups(item.cst, item.destinations);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_byAdgroup(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

      if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }

    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 3,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para los Adgroups Seleccionados - Completada");
    res.status(200).json({"msg":"Negativización para los Adgroups Seleccionados - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para los AdGroups Seleccionados:", error.message);
    res.status(500).json({"error": error.message });
  }
};

//Negativización por Campaña

const negativize_SP_CSTs_ByCampaigns = async (bodySP) => {
  try {
    const responseStatus = await spCampaignsNegativization(bodySP);
    return responseStatus;
  } catch (error) {
    console.error("Ocurrió un Error al Negativizar los SP CSTs por Campaña respetiva:", error.message);
  }
};

const process_Respective_Campaign = async (searchTerms) =>{
  try{

    const spCSTs = [];
    const sbCSTs = [];

    searchTerms.forEach(item => {
      if(item.type === "Sponsored Products"){
        let spCST = {
          campaignId : item.campaignId,
          keywordText : item.cst,
          state: "ENABLED",
          matchType : "NEGATIVE_EXACT"
        }
        spCSTs.push(spCST); 
      } else if (item.type === "Sponsored Brands"){
          if(item.destinations.campaign.adGroups.length!==0){
            item.destinations.campaign.adGroups.forEach((ag)=>{
              let sbCST = {
                campaignId : item.campaignId,
                adGroupId : ag.adGroupId,
                keywordText : item.cst,
                matchType : "negativeExact"
              }
              sbCSTs.push(sbCST);
          });
        }else{
          console.log("Campaña SB sin AdGroups para poder Negativizar");
        }
      }
    });

    const spCSTs2 = [];
    const sbCSTs2 = [];

    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){


        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
       
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para las Campañas Seleccionadas:", error.message);
  }
} 

const negativization_CSTs_By_Respective_Campaign = async (req, res) => {
  try{

    const searchTerms = req.body;

    const cstJSON = await process_Respective_Campaign(searchTerms);

    if(cstJSON.spCSTs.length===1){
      if(cstJSON.spCSTs[0].length>=1){
        console.log(cstJSON.spCSTs[0]);
        const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
        if(responseStatus === 207){
          console.log("array JSON SP negativizado correctamente");
        }else{
          console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
        }
      }
    }else{
      cstJSON.spCSTs.forEach(async (array)=>{
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
      });
    }

    if(cstJSON.sbCSTs.length===1){
      if(cstJSON.sbCSTs[0].length>=1){
        console.log(cstJSON.sbCSTs[0]);
        const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
        if(responseStatus === 207){
          console.log("array JSON SB negativizado correctamente");
        }else{
          console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
        }
      }
    }else{
      cstJSON.sbCSTs.forEach(async (array)=>{
          const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
      });
    }

    //guarda en BD
    searchTerms.forEach(async (item) => {
      let body = {
          search_terms_reports_id: 1,
          ads_accounts_id: 2,
          sponsored_type_id: item.type === "Sponsored Products" ? 1 : 2,
          segmentation_id: null,
          negativization_mode_id: 4,
          campaign: item.campaign,
          ad_group: item.ad_group,
          campaigns_id: 1,
          ad_groups_id: 1,
          targeting : item.targeting,
          match_type_id: item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
          customer_search_term: item.cst,
          negative_type_id : 1,
          customer_search_terms_states_id : 1,
          users_id: 1 ,
          destinations: null
      }

      await CustomerSearchTermModel.create(body);

    });
    
    console.log("Negativización por Campaña Respectiva - Completada");
    res.status(200).json({"msg":"Negativización por Campaña Respectiva - Completada"});
  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs por Campaña respectiva:", error.message);
    res.status(500).json({"error": error.message });
  }
};


const process_All_Campaigns = async (searchTerm) =>{
  try{

    const body = {
      "stateFilter": {
        "include": [
          "ENABLED", "PAUSED"
        ]
      }
    }

    const spCSTs = [];
    const sbCSTs = [];

    const response = await campaignsListSP(body);
    const response2 = await adGroupsListSB(body);

    if(response){
      const spCampaigns = response.campaigns;

      if(spCampaigns.length!==0){
        spCampaigns.forEach((c) => {
          let spCST = {
            campaignId: c.campaignId,
            state: "ENABLED",
            keywordText: searchTerm,
            matchType: "NEGATIVE_EXACT"
          }
          spCSTs.push(spCST);
        });
      }else{
        console.log("No hay Campañas SP disponibles para Negativizar");
      }
    }else{
      console.log("Error al Obtener las Campañas SP");
    }
      

    if(response2){
      const sbAdgroups = response2.adGroups;

      if(sbAdgroups.length!==0){
        sbAdgroups.forEach((ag) => {
          let sbCST = {
            campaignId: ag.campaignId,
            adGroupId: ag.adGroupId,
            keywordText: searchTerm,
            matchType: "negativeExact"
          }
          sbCSTs.push(sbCST);
        });
      }else{
        console.log("No hay AdGroups SB disponibles para Negativizar");
      }
    }else{
      console.log("Error al Obtener los AdGroups SB");
    }
      

    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){

        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
      
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para Todas las Campaña:", error.message);
  }
}

const negativize_CSTs_All_Campaigns = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_All_Campaigns(item.cst);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else if (cstJSON.spCSTs.length>1){
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

      if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else if (cstJSON.sbCSTs.length>1){
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }

    }

    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 5,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: null
      }
      await CustomerSearchTermModel.create(body);

    });

    console.log("Negativización para Todas las Campañas - Completada");
    res.status(200).json({"msg":"Negativización para Todas las Campañas - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para Todas las Campañas:", error.message);
    res.status(500).json({"error": error.message });
  }
}

const process_Select_Campaigns = async (cst , destinations) =>{
  try{

    const spCSTs = [];
    const sbCSTs = [];

    destinations.campaigns.forEach((c) => {
      if(c.type === "SP"){
        let spCST = {
          campaignId: c.campaignId,
          state: "ENABLED",
          keywordText: cst,
          matchType: "NEGATIVE_EXACT"
        }
        spCSTs.push(spCST);
      } else if (c.type === "SB"){
          if(c.adGroups.length!==0){
            c.adGroups.forEach((ag)=>{
              let sbCST = {
                campaignId: c.campaignId,
                adGroupId: ag.adGroupId,
                keywordText: cst,
                matchType: "negativeExact"
              }
              sbCSTs.push(sbCST);
            });
          }else{
            console.log("Campaña SB sin AdGroups para poder Negativizar");
          }
      }
    });

    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){


        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
       
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }

  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para las Campañas Seleccionadas:", error.message);
  }
} 

const negativization_CSTs_By_Select_Campaigns = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Select_Campaigns(item.cst, item.destinations);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else if (cstJSON.spCSTs.length>1){
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

      if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else if (cstJSON.sbCSTs.length>1){
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }

    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 6,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para las Campañas Seleccionadas - Completada");
    res.status(200).json({"msg":"Negativización para las Campañas Seleccionadas - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para las Campañas Seleccionadas:", error.message);
    res.status(500).json({"error": error.message });
  }
};

//Negativización por Portafolio

const process_Respective_Portfolio = async (cst, destinations) => {
  try { 
    
    const spCSTs = [];
    const sbCSTs = [];

    destinations.portfolio.campaigns.forEach((c) => {
      if(c.type === "SP"){
        let spCST = {
          campaignId: c.campaignId,
          state: "ENABLED",
          keywordText: cst,
          matchType: "NEGATIVE_EXACT"
        }
        spCSTs.push(spCST);
      } else if (c.type === "SB"){
          if(c.adGroups.length!==0){
            c.adGroups.forEach((ag)=>{
              let sbCST = {
                campaignId: c.campaignId,
                adGroupId: ag.adGroupId,
                keywordText: cst,
                matchType: "negativeExact"
              }
              sbCSTs.push(sbCST);
            });
          }else{
            console.log("Campaña SB sin AdGroups para poder Negativizar");
          }
      }
    });

    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){


        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
        
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }
  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para los Portafolios Seleccionados:", error.message);
  }
}

const negativization_CSTs_By_Respective_Portfolio = async (req, res) => {
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Respective_Portfolio(item.cst, item.destinations);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

    if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }
        
    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 7,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para los Respectivos Portafolios - Completada");
    res.status(200).json({"msg":"Negativización para los Respectivos Portafolios  - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para los Respectivos Portafolios :", error.message);
    res.status(500).json({"error": error.message });
  }
};

const process_ = async (portfolioId,searchTerm) => {
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
    console.error("Ocurrió un error al procesar las campañas SP por portafolio: ",error.message);
    //res.status(500).json({ msg: error.message })
  }
}


const negativize_CSTs_All_Portfolios = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    const body = {
      "stateFilter": {
        "include": [
          "ENABLED"
        ]
      }
    } 

    const response = await portfoliosList(body);

    const portfolioData = response.portfolios;

    if(portfolioData.length!==0){

      const filteredPortfolios = portfolioData.map(item=>({
        portfolioId: item.portfolioId
      }));

      for (const item of searchTerms){
        
        for (const portfolio of filteredPortfolios){
          const cstJSON = await process_Respective_Portfolio(portfolio.portfolioId,item.cst);

          if(cstJSON.spCSTs.length===1){
            if(cstJSON.spCSTs[0].length>=1){
              console.log(cstJSON.spCSTs[0]);
              const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
              if(responseStatus === 207){
                console.log("array JSON SP negativizado correctamente");
                continue;
              }else{
                console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
              }
            }
          }else{
            cstJSON.spCSTs.forEach(async (array)=>{
                const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
                if(responseStatus === 207){
                  console.log("array JSON SP negativizado correctamente");
                }else{
                  console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
                }
            });
          }
    
          if(cstJSON.sbCSTs.length===1){
            if(cstJSON.sbCSTs[0].length>=1){
              console.log(cstJSON.sbCSTs[0]);
              const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
              if(responseStatus === 207){
                console.log("array JSON SB negativizado correctamente");
                continue;
              }else{
                console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
              }
            }
          }else{
            cstJSON.sbCSTs.forEach(async (array)=>{
                const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
                if(responseStatus === 207){
                  console.log("array JSON SB negativizado correctamente");
                }else{
                  console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
                }
            });
          }
        }
      }

      searchTerms.forEach(async (item) => {
        let body = {
          search_terms_reports_id: item.reportId,
          ads_accounts_id: 2,
          sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
          segmentation_id: item.section,
          negativization_mode_id: 8,
          campaign:{
            "campaignId": item.campaign.campaignId,
            "campaignName": item.campaign.campaignName,
          },
          adGroup:{
            "adGroupId": item.adGroup.adGroupId,
            "adGroupName": item.adGroup.adGroupName,
          },
          campaigns_id: 1,
          ad_groups_id: 1,
          targeting : item.targeting,
          match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
          keyword: item.cst,  
          negative_type_id : 1,
          customer_search_terms_states_id : 1,
          users_id: 1 ,
          destinations: null
        }
        await CustomerSearchTermModel.create(body);

      });

      console.log("Negativización para Todos los Portafolios - Completada");
      res.status(200).json({"msg":"Negativización paraTodos los Portafolios - Completada"});
    }else{
      console.log("No hay Portafolios Disponibles para Negativizar");
      res.status(404).json({"msg": "No hay Portafolios Disponibles para Negativizar"});
    }

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para Todos los Portafolios:", error.message);
    res.status(500).json({"error": error.message });
  }
}

const process_Select_Portfolios = async (cst , destinations) =>{
  try{

      const spCSTs = [];
      const sbCSTs = [];

      destinations.portfolios.forEach((p) => {
        p.campaigns.forEach((c)=>{
          if(c.type === "SP"){
            let spCST = {
              campaignId: c.campaignId,
              state: "ENABLED",
              keywordText: cst,
              matchType: "NEGATIVE_EXACT"
            }
            spCSTs.push(spCST);
          } else if (c.type === "SB"){
              if(c.adGroups.length!==0){
                c.adGroups.forEach((ag)=>{
                  let sbCST = {
                    campaignId: c.campaignId,
                    adGroupId: ag.adGroupId,
                    keywordText: cst,
                    matchType: "negativeExact"
                  }
                  sbCSTs.push(sbCST);
                });
              }else{
                console.log("Campaña SB sin AdGroups para poder Negativizar");
              }
          }
        });
      });

      const spCSTs2 = [];
      const sbCSTs2 = [];
    
      if(spCSTs.length>1000 || sbCSTs.length>100){
        if(spCSTs.length>1000){

          for (let i=0; i<spCSTs.length; i+=1000){
            spCSTs2.push(spCSTs.slice(i,i+1000));
          }
        }

        if(sbCSTs.length>100){

          for(let i=0; i<sbCSTs.length; i+=100){
            sbCSTs2.push(sbCSTs.slice(i,i+100));
          }
        }

        const body = {
          "spCSTs": spCSTs2,
          "sbCSTs": sbCSTs2
        }

        return body;
      }else{
         
        const body = {
          "spCSTs": [spCSTs],
          "sbCSTs": [sbCSTs]
        }
  
        return body;
      }
  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para los Portafolios Seleccionados:", error.message);
  }
} 

const negativization_CSTs_By_Select_Portfolios = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Select_Portfolios(item.cst, item.destinations);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

    if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else{
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }

  
    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 9,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para los Portafolios Seleccionados - Completada");
    res.status(200).json({"msg":"Negativización para los Portafolios Seleccionados  - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para los Portafolios Seleccionados :", error.message);
    res.status(500).json({"error": error.message });
  }
};

//Negativización por 

const process_Respective_ASIN = async (cst, destinations) => {
  try { 
    
    const spCSTs = [];
    const sbCSTs = [];

    destinations.asin.campaigns.forEach((c) => {
      if(c.type === "SP"){
        let spCST = {
          campaignId: c.campaignId,
          state: "ENABLED",
          keywordText: cst,
          matchType: "NEGATIVE_EXACT"
        }
        spCSTs.push(spCST);
      } else if (c.type === "SB"){
          if(c.adGroups.length!==0){
            c.adGroups.forEach((ag)=>{
              let sbCST = {
                campaignId: c.campaignId,
                adGroupId: ag.adGroupId,
                keywordText: cst,
                matchType: "negativeExact"
              }
              sbCSTs.push(sbCST);
            });
          }else{
            console.log("Campaña SB sin AdGroups para poder Negativizar");
          }
      }
    });

    const spCSTs2 = [];
    const sbCSTs2 = [];
  
    if(spCSTs.length>1000 || sbCSTs.length>100){
      if(spCSTs.length>1000){

        for (let i=0; i<spCSTs.length; i+=1000){
          spCSTs2.push(spCSTs.slice(i,i+1000));
        }
      }

      if(sbCSTs.length>100){


        for(let i=0; i<sbCSTs.length; i+=100){
          sbCSTs2.push(sbCSTs.slice(i,i+100));
        }
      }

      const body = {
        "spCSTs": spCSTs2,
        "sbCSTs": sbCSTs2
      }

      return body;
    }else{
        
      const body = {
        "spCSTs": [spCSTs],
        "sbCSTs": [sbCSTs]
      }

      return body;
    }
  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para los Portafolios Seleccionados:", error.message);
  }
}

const negativization_CSTs_By_Respective_ASIN = async (req, res) => {
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Respective_ASIN(item.cst, item.destinations);
      
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else if (cstJSON.spCSTs.length>1) {
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

    if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else if (cstJSON.spCSTs.length>1){
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }
        
    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 10,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para los Respectivos ASINs - Completada");
    res.status(200).json({"msg":"Negativización para los Respectivos ASINs  - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para los Respectivos ASINs:", error.message);
    res.status(500).json({"error": error.message });
  }
};


const negativize_CSTs_All_ASINs = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    const body = {
      "stateFilter": {
        "include": [
          "ENABLED"
        ]
      }
    } 

    const response = await portfoliosList(body);

    const portfolioData = response.portfolios;

    if(portfolioData.length!==0){

      const filteredPortfolios = portfolioData.map(item=>({
        portfolioId: item.portfolioId
      }));

      for (const item of searchTerms){
        
        for (const portfolio of filteredPortfolios){
          const cstJSON = await process_Respective_ASIN(portfolio.portfolioId,item.cst);

          if(cstJSON.spCSTs.length!==0){
            console.log(cstJSON.spCSTs);
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs);
            if(responseStatus === 207){
              continue;
            }
          }

          if(cstJSON.sbCSTs.length!==0){
            console.log(cstJSON.sbCSTs);
            const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs);
            if(responseStatus === 207 ){
              continue;
            } 
          }

        }

      }

      searchTerms.forEach(async (item) => {
        let body = {
          search_terms_reports_id: item.reportId,
          ads_accounts_id: 2,
          sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
          segmentation_id: item.section,
          negativization_mode_id: 11,
          campaign:{
            "campaignId": item.campaign.campaignId,
            "campaignName": item.campaign.campaignName,
          },
          adGroup:{
            "adGroupId": item.adGroup.adGroupId,
            "adGroupName": item.adGroup.adGroupName,
          },
          campaigns_id: 1,
          ad_groups_id: 1,
          targeting : item.targeting,
          match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
          keyword: item.cst,  
          negative_type_id : 1,
          customer_search_terms_states_id : 1,
          users_id: 1 ,
          destinations: null
        }
        await CustomerSearchTermModel.create(body);

      });

      console.log("Negativización para Todos los Portafolios - Completada");
      res.status(200).json({"msg":"Negativización paraTodos los Portafolios - Completada"});
    }else{
      console.log("No hay Portafolios Disponibles para Negativizar");
      res.status(404).json({"msg": "No hay Portafolios Disponibles para Negativizar"});
    }

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para Todos los Portafolios:", error.message);
    res.status(500).json({"error": error.message });
  }
}

const process_Select_ASINs = async (cst , destinations) =>{
  try{

      const spCSTs = [];
      const sbCSTs = [];

      destinations.asins.forEach((a) => {
        a.campaigns.forEach((c)=>{
          if(c.type === "SP"){
            let spCST = {
              campaignId: c.campaignId,
              state: "ENABLED",
              keywordText: cst,
              matchType: "NEGATIVE_EXACT"
            }
            spCSTs.push(spCST);
          } else if (c.type === "SB"){
              if(c.adGroups.length!==0){
                c.adGroups.forEach((ag)=>{
                  let sbCST = {
                    campaignId: c.campaignId,
                    adGroupId: ag.adGroupId,
                    keywordText: cst,
                    matchType: "negativeExact"
                  }
                  sbCSTs.push(sbCST);
                });
              }else{
                console.log("Campaña SB sin AdGroups para poder Negativizar");
              }
          }
        });
      });

      const spCSTs2 = [];
      const sbCSTs2 = [];
    
      if(spCSTs.length>1000 || sbCSTs.length>100){
        if(spCSTs.length>1000){

          for (let i=0; i<spCSTs.length; i+=1000){
            spCSTs2.push(spCSTs.slice(i,i+1000));
          }
        }

        if(sbCSTs.length>100){

          for(let i=0; i<sbCSTs.length; i+=100){
            sbCSTs2.push(sbCSTs.slice(i,i+100));
          }
        }

        const body = {
          "spCSTs": spCSTs2,
          "sbCSTs": sbCSTs2
        }

        return body;
      }else{
         
        const body = {
          "spCSTs": [spCSTs],
          "sbCSTs": [sbCSTs]
        }
  
        return body;
      }
  }catch(error){
    console.error("Ocurrió un Error al Procesar los CSTs por Negativizar para los Portafolios Seleccionados:", error.message);
  }
} 

const negativization_CSTs_By_Select_ASINs = async (req,res) =>{
  
  try{

    const searchTerms = req.body;

    for (const item of searchTerms){

      const cstJSON = await process_Select_ASINs(item.cst, item.destinations);
            
      if(cstJSON.spCSTs.length===1){
        if(cstJSON.spCSTs[0].length>=1){
          console.log(cstJSON.spCSTs[0]);
          const responseStatus = await negativize_SP_CSTs_ByCampaigns(cstJSON.spCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SP negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
          }
        }
      }else if(cstJSON.spCSTs.length>1){
        cstJSON.spCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SP_CSTs_ByCampaigns(array);
            if(responseStatus === 207){
              console.log("array JSON SP negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SP - status: ",responseStatus);
            }
        });
      }

    if(cstJSON.sbCSTs.length===1){
        if(cstJSON.sbCSTs[0].length>=1){
          console.log(cstJSON.sbCSTs[0]);
          const responseStatus = await negativize_SB_CSTs_byAdgroup(cstJSON.sbCSTs[0]);
          if(responseStatus === 207){
            console.log("array JSON SB negativizado correctamente");
            continue;
          }else{
            console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
          }
        }
      }else if(cstJSON.sbCSTs.length>1){
        cstJSON.sbCSTs.forEach(async (array)=>{
            const responseStatus = await negativize_SB_CSTs_byAdgroup(array);
            if(responseStatus === 207){
              console.log("array JSON SB negativizado correctamente");
            }else{
              console.log("Error al Negativizar el array JSON SB - status: ",responseStatus);
            }
        });
      }
    }

  
    //Guardar en BD al completar la negativizacion
    searchTerms.forEach(async (item) => {
      let body = {
        search_terms_reports_id: item.reportId,
        ads_accounts_id: 2,
        sponsored_type_id: item.sponsoredTypeName === "Sponsored Products" ? 1 : 2,
        segmentation_id: null,
        negativization_mode_id: 12,
        campaign:{
          "campaignId": item.campaign.campaignId,
          "campaignName": item.campaign.campaignName,
        },
        adGroup:{
          "adGroupId": item.adGroup.adGroupId,
          "adGroupName": item.adGroup.adGroupName,
        },
        campaigns_id: 1,
        ad_groups_id: 1,
        targeting : item.targeting,
        match_type_id : item.matchType === "EXACT" ? 1 : item.matchType === "PHRASE" ? 2 : 3,
        keyword: item.cst,  
        negative_type_id : 1,
        customer_search_terms_states_id : 1,
        users_id: 1 ,
        destinations: item.destinations
      }
      await CustomerSearchTermModel.create(body);
    });
    
    console.log("Negativización para los ASINs Seleccionados - Completada");
    res.status(200).json({"msg":"Negativización para los ASINs Seleccionados - Completada"});

  }catch(error){
    console.error("Ocurrió un Error al Negativizar los CSTs para los ASINs Seleccionados :", error.message);
    res.status(500).json({"error": error.message });
  }
};

module.exports = {
negativization_CSTs_By_Respective_Adgroup, 
negativize_CSTs_All_AdGroups, 
negativization_CSTs_By_Select_Adgroups,
negativization_CSTs_By_Respective_Campaign, 
negativize_CSTs_All_Campaigns, 
negativization_CSTs_By_Select_Campaigns,
negativization_CSTs_By_Respective_Portfolio,
negativize_CSTs_All_Portfolios,
negativization_CSTs_By_Select_Portfolios,
negativization_CSTs_By_Respective_ASIN,
negativize_CSTs_All_ASINs,
negativization_CSTs_By_Select_ASINs};
