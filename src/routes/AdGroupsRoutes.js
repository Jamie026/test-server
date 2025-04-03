const express = require("express");
const { saveAdGroupsSP, saveAdGroupsSB } = require("../controllers/AdGroupsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// Definimos nuestras rutas para los adgroups
router.post("/sp", saveAdGroupsSP);
router.post("/sb", saveAdGroupsSB);

module.exports = router;