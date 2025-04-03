const express = require("express");
const { getAsins, saveAsins } = require("../controllers/AsinController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Aplicar middleware
router.use(authenticateToken);

// Definimos nuestras rutas para los ASIN
router.get("/", getAsins);
router.post("/save", saveAsins);

module.exports = router;