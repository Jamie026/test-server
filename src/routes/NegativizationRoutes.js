const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const {
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
    negativization_CSTs_By_Select_ASINs
} = require("../controllers/NegativizationController");

// middleware
router.use(authenticateToken);

// Rutas de Negativización
router.post("/respectiveAdgroup", negativization_CSTs_By_Respective_Adgroup);
router.post("/allAdgroups", negativize_CSTs_All_AdGroups);
router.post("/selectAdGroups", negativization_CSTs_By_Select_Adgroups);
router.post("/respectiveCampaign", negativization_CSTs_By_Respective_Campaign);
router.post("/allCampaigns", negativize_CSTs_All_Campaigns);
router.post("/selectCampaigns", negativization_CSTs_By_Select_Campaigns);
router.post("/respectivePortfolio", negativization_CSTs_By_Respective_Portfolio);
router.post("/allPortfolios", negativize_CSTs_All_Portfolios);
router.post("/selectPortfolios", negativization_CSTs_By_Select_Portfolios);
router.post("/respectiveASIN", negativization_CSTs_By_Respective_ASIN);
router.post("/allASINs", negativize_CSTs_All_ASINs);
router.post("/selectASINs", negativization_CSTs_By_Select_ASINs);

module.exports = router;