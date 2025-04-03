const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const ParametrosController = require('../controllers/ParametrosController');

// middleware
router.use(authenticateToken);

// Rutas para obtener datos
router.get('/adgroups', ParametrosController.getAdGroups);
router.get('/campaigns', ParametrosController.getCampaigns);
router.get('/portfolios', ParametrosController.getPortfolios);
router.get('/skus', ParametrosController.getSKUs);
router.get('/asins', ParametrosController.getASINs);

// Ruta para guardar parámetros
router.post('/parametros', ParametrosController.saveParametros);

module.exports = router;