const axios = require("axios");
const zlib = require("zlib");
const amazonAdsConfig = require("../config/AmazonAdsConfig");
const { getYesterdayDate } = require("../utils/dateUtils");
const Report = require("../models/ReportModel");
const { add } = require("winston");

const apiUrl = amazonAdsConfig.baseURL;

async function spNegativization(spbody) { // Añadido sponsored_type_id como parámetro
    
    const date = getYesterdayDate();
    //let accessToken = await getAccessToken();
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    console.log(accessToken);


    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId":  amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope":  amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spNegativeKeyword.v3+json",
        "Accept": "application/vnd.spNegativeKeyword.v3+json"
    };

    body = {
        "negativeKeywords": spbody
    };

    try {
        console.log("ingresando a try");
        console.log(body);
        const response = await axios.post(`${apiUrl}/sp/negativeKeywords`, body, { headers });
        //console.log(response);
        if (response.status === 207) {
            console.log(response.status);
            console.log(response.data);
            console.log("SP CSTs por AdGroup - Negativizados Correctamente");
            //return response.data;
            return response.status;
        } else if (response.status === 401) {
            console.warn("⚠️ ACCESS_TOKEN expirado. Renovando...");
            let accessToken = await amazonAdsConfig.getValidAccessToken();
            headers.Authorization = `Bearer ${accessToken}`;
            let response2 = await axios.post(`${apiUrl}/sp/negativeKeywords`, body, { headers });
            if (response2.status === 207) {
                console.log(response2.data);
                console.log("SP CSTs por Adgroup - Negativizados Correctamente 2");
                //return response2.data;
                return response2.status;
            } else {
                throw new Error(`Error en la Negativización de SP CSTs por AdGroup , tras renovar token : ${response2.status}`);
            }
        } else {
            throw new Error(`Error en la Negativización de SP CSTs por AdGroup : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error en la Negativización de SP CSTs por AdGroup: ${error.message}`);
    }
}


async function sbNegativization(sbbody) { // Añadido sponsored_type_id como parámetro
    
    const date = getYesterdayDate();
    //let accessToken = await getAccessToken();
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    console.log(accessToken);


    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId":  amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope":  amazonAdsConfig.profileId,
        "Content-Type": "application/json",
        "Accept": "application/vnd.sbkeywordresponse.v3+json"
    };

    body = sbbody;


    try {
        console.log("ingresando a try");
        console.log(body);
        const response = await axios.post(`${apiUrl}/sb/negativeKeywords`, body, { headers });
        //console.log(response);
        if (response.status === 207) {
            console.log(response.data);
            console.log("SB CSTs por AdGroup - Negativizados Correctamente");
            //return response.data;
            return response.status;
        } else if (!response.ok) {
            console.warn("⚠️ ACCESS_TOKEN expirado. Renovando...");
            let accessToken = await amazonAdsConfig.getValidAccessToken();
            headers.Authorization = `Bearer ${accessToken}`;
            let response2 = await axios.post(`${apiUrl}/sp/negativeKeywords`, body, { headers });
            if (response2.status === 207) {
                console.log(response2.data);
                console.log("SB CSTs por AdGroup - Negativizados Correctamente");
                //return response2.data;
                return response2.status;
            } else {
                throw new Error(`Error en la Negativización de SB CSTs por AdGroup ,tras renovar token: ${response.status}`);
            }
        } else {
            throw new Error(`Error en la Negativización de SB CSTs por AdGroup: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error en la Negativización de SB CSTs por AdGroup: ${error.message}`);
    }
}

async function spCampaignsNegativization(spbody) { // Añadido sponsored_type_id como parámetro
    
    const date = getYesterdayDate();
    //let accessToken = await getAccessToken();
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    console.log(accessToken);


    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId":  amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope":  amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.spcampaignNegativeKeyword.v3+json",
        "Accept": "application/vnd.spcampaignNegativeKeyword.v3+json"
    };

    body = {
        "campaignNegativeKeywords": spbody
    };

    try {
        console.log("ingresando a try");
        console.log(body);
        const response = await axios.post(`${apiUrl}/sp/campaignNegativeKeywords`, body, { headers });
        //console.log(response);
        if (response.status === 207) {
            console.log(response.status);
            console.log(response.data);
            console.log("SP CSTs Por Campaña - Negativizados Correctamente");
            //return response.data;
            return response.status;
        } else if (response.status === 401) {
            console.warn("⚠️ ACCESS_TOKEN expirado. Renovando...");
            let accessToken = await amazonAdsConfig.getValidAccessToken();
            headers.Authorization = `Bearer ${accessToken}`;
            let response2 = await axios.post(`${apiUrl}/sp/campaignNegativeKeywords`, body, { headers });
            if (response2.status === 207) {
                console.log(response2.data);
                console.log("SP CSTs Por Campaña - Negativizados Correctamente 2");
                //return response2.data;
                return response2.status;
            } else {
                throw new Error(`Error en la Negativización de SP CSTs Por Campaña , tras renovar token : ${response2.status}`);
            }
        } else {
            throw new Error(`Error en la Negativización de SP CSTs Por Campaña : ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error en la Negativización de SP CSTs Por Campaña: ${error.message}`);
    }
}

async function getReport(reportId) {
    //const accessToken = await getAccessToken();
    const accessToken = await amazonAdsConfig.getValidAccessToken();
    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId":  amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope":  amazonAdsConfig.profileId,
    };

    const apiUrl = "https://advertising-api.amazon.com";

    try {
        const response = await axios.get(`${apiUrl}/reporting/reports/${reportId}`, { headers });

        if (response.status === 200) {
            console.log("El Status del Reporte es: ",response.data.status);
            return response.data;
        } else {
            throw new Error(`Error al obtener el estado del reporte: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al consultar el estado del reporte: ${error.message}`);
    }
}

async function downloadAndProcessReport(locationUrl) {
    try {
        const response = await axios.get(locationUrl, { responseType: "arraybuffer" });
        const decompressedData = zlib.gunzipSync(response.data).toString();
        const reportData = JSON.parse(decompressedData);
        return reportData;
    } catch (error) {
        throw new Error(`Error al descargar o procesar el reporte: ${error.message}`);
    }
}

async function saveReportToDatabase(reportData, transaction) {
    try {
        // Actualizamos el registro existente en lugar de crear uno nuevo
        const [updatedCount, updatedReports] = await Report.update(
            {
                report_data: {
                    "data": reportData.report_data
                },
                date: reportData.date,
                ads_accounts_id: 2
            },
            {
                where: { id: reportData.id },
                transaction,
                returning: true
            }
        );
        //report_data: JSON.stringify(reportData.report_data),
        if (updatedCount === 0) {
            throw new Error(`No se encontró reporte con ID ${reportData.id} para actualizar`);
        }
        //console.log("✅ Reporte guardado exitosamente:", updatedReports[0]);
        console.log("✅ Reporte guardado exitosamente:", reportData.report_data[0]);
        return updatedReports[0];
    } catch (error) {
        console.error("❌ Error al guardar el reporte en la base de datos:", error.message);
        throw error;
    }
}

module.exports = {
    spNegativization,
    sbNegativization,
    spCampaignsNegativization
};