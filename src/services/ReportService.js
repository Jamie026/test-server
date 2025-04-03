const axios = require("axios");
const zlib = require("zlib");
//const { apiUrl, clientId, getAccessToken, profileId, contentType, refreshAccessToken } = require("../config/AmazonAdsConfig");
const amazonAdsConfig = require("../config/AmazonAdsConfig");
const { getYesterdayDate } = require("../utils/dateUtils");
const Report = require("../models/ReportModel");
const { add } = require("winston");

//const apiUrl = "https://advertising-api.amazon.com/reporting/reports";

async function generateDailyReport(sponsored_type_id) { // Añadido sponsored_type_id como parámetro
    const date = getYesterdayDate();
    //let accessToken = await getAccessToken();
    const accessToken = await amazonAdsConfig.getValidAccessToken();

    console.log(accessToken);

    const apiUrl = "https://advertising-api.amazon.com";

    const headers = {
        "Authorization": `Bearer ${accessToken}`,
        "Amazon-Advertising-API-ClientId":  amazonAdsConfig.clientId,
        "Amazon-Advertising-API-Scope":  amazonAdsConfig.profileId,
        "Content-Type": "application/vnd.createasyncreportrequest.v3+json",
        "Accept": "application/vnd.createasyncreportrequest.v3+json"
    };

    //Error http 425 - Too Early
    const body = {
        name: `${sponsored_type_id === 1 ? 'SP' : 'SB'} search terms report ${date}`,
        startDate: date,
        endDate: date,
        configuration: {
            adProduct: sponsored_type_id === 1 ? "SPONSORED_PRODUCTS" : "SPONSORED_BRANDS",
            groupBy: ["searchTerm"],
            columns: sponsored_type_id === 1 ? ["impressions","clicks","cost","campaignId","adGroupId","startDate","endDate","keywordType","keyword","matchType","keywordId","searchTerm"] : [
                "impressions",
                "clicks",
                "cost",
                "campaignId",
                "adGroupId",
                "startDate",
                "endDate",
                "matchType",
                "keywordId",
                "searchTerm"
            ],
            "filters": [
              {
                "field": "keywordType",
                "values": [
                    "BROAD",
                    "PHRASE",
                    "EXACT"
                ]
            }],
            reportTypeId: sponsored_type_id === 1 ? "spSearchTerm" : "sbSearchTerm",
            timeUnit: "SUMMARY",
            format: "GZIP_JSON",
        },
    };

    try {
        console.log("ingresando a try");
        console.log(body);
        const response = await axios.post(`${apiUrl}/reporting/reports`, body, { headers });
        //console.log(response);
        if (response.status === 200) {
            console.log(response.data);
            console.log("El ReportID del Reporte es: ",response.data.reportId);
            return response.data.reportId;
        } else if (response.status === 401) {
            console.warn("⚠️ ACCESS_TOKEN expirado. Renovando...");
            //await refreshAccessToken();
            //accessToken = await getAccessToken();
            let accessToken = await amazonAdsConfig.getValidAccessToken();
            headers.Authorization = `Bearer ${accessToken}`;
            let response = await axios.post(`${apiUrl}/reporting/reports`, body, { headers });
            if (response.status === 200) {
                console.log("El ReportID del Reporte es: ",response.data.reportId);
                console.log("ReportData: ",response.data);
                console.log("Status: ",response.data.status);
                return response.data.reportId;
            } else {
                throw new Error(`Error generando reporte tras renovar token: ${response.status}`);
            }
        } else {
            throw new Error(`Error generando reporte: ${response.status}`);
        }
    } catch (error) {
        throw new Error(`Error al generar el reporte (en reportService.js): ${error.message}`);
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
    generateDailyReport,
    getReport,
    downloadAndProcessReport,
    saveReportToDatabase,
};