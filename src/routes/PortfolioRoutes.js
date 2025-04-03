const express = require("express");
const { getPortfolios, savePortfolios } = require("../controllers/PortfolioController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

//  middleware
router.use(authenticateToken);

// Definimos nuestras rutas para los portafolios
router.get("/", getPortfolios);
router.post("/save", savePortfolios);

module.exports = router;