const express = require("express");
const { getNegativizationModes } = require("../controllers/ModeNegativizationController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

//middleware
router.use(authenticateToken);

// Definimos nuestras rutas
router.get("/", getNegativizationModes);

module.exports = router;