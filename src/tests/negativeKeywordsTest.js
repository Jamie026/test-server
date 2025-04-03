// src/test/negativeKeywordsTest.js

const axios = require("axios");
require("dotenv").config();

// Configuración de las credenciales y la URL
const apiUrl = "https://advertising-api.amazon.com/sp/negativeKeywords";
const clientId = process.env.AMAZON_ADS_CLIENT_ID;
const accessToken = process.env.AMAZON_ADS_ACCESS_TOKEN;
const profileId = process.env.AMAZON_ADS_PROFILE_ID;

// Función para enviar la solicitud POST
async function testNegativeKeywords() {
  const headers = {
    "Authorization": `Bearer ${accessToken}`,
    "Amazon-Advertising-API-ClientId": clientId,
    "Amazon-Advertising-API-Scope": profileId,
    "Content-Type": "application/vnd.spNegativeKeyword.v3+json",
    "Accept": "application/vnd.spNegativeKeyword.v3+json",
  };

  const body = {
    negativeKeywords: [
      {
        campaignId: "124568397123656",
        matchType: "NEGATIVE_EXACT",
        state: "ENABLED",
        adGroupId: "144119419384685",
        keywordText: "chris",
      },
    ],
  };

  try {
    console.log("Enviando solicitud a Amazon Ads API...");
    const response = await axios.post(apiUrl, body, { headers });
    console.log("Solicitud exitosa. Respuesta de la API:");
    console.log(response.data);
  } catch (error) {
    console.error("Error al realizar la solicitud:", error.message);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
  }
}

//testNegativeKeywords();
