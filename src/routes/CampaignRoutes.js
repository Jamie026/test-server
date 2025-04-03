const express = require("express");
const { getCampaigns, saveCampaignsSP, saveCampaignsSB, getCampaignsByPortfolio, getCampaignsByGroup, fetchAllCurrentCampaignsByPortfolio } = require("../controllers/CampaignController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Aplicar middleware
router.use(authenticateToken);

// Definimos nuestras rutas para las campañas
router.get("/", getCampaigns);
router.post("/sp", saveCampaignsSP);
router.post("/sb", saveCampaignsSB);
router.get('/campaingns-porfolio', getCampaignsByPortfolio);
router.get('/campaingns-groups', getCampaignsByGroup);
router.post("/test", fetchAllCurrentCampaignsByPortfolio);

module.exports = router;
