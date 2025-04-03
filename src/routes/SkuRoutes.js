const express = require("express");
const { getSkus, saveSKUs } = require("../controllers/SkuController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

//  middleware
router.use(authenticateToken);

// Definimos nuestras rutas para los SKUs
router.get("/", getSkus);
router.post("/save", saveSKUs);

module.exports = router;