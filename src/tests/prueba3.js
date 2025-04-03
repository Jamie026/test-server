const axios = require("axios");
require("dotenv").config();

async function listProducts() {
  const apiUrl = "https://advertising-api.amazon.com/sp/campaigns/list";
  const headers = {
    Authorization: `Bearer ${process.env.AMAZON_ADS_ACCESS_TOKEN}`,
    "Amazon-Advertising-API-ClientId": process.env.AMAZON_ADS_CLIENT_ID,
    "Amazon-Advertising-API-Scope": process.env.AMAZON_ADS_PROFILE_ID,
    "Content-Type": "application/vnd.spCampaign.v3+json",
    Accept: "application/vnd.spCampaign.v3+json",
  };

  console.log(headers.Authorization)
  try {
    const response = await axios.post(apiUrl, null, {headers});
    console.log("Productos obtenidos con éxito:");
    console.log(response.data);
  } catch (error) {
    console.error("Error al listar campañas:", error.message);
    if (error.response) {
      console.error("Detalles del error:", error.response.data);
    }
  }
}

//listProducts();
