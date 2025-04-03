const express = require('express');
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const { saveSearchTermData, getSearchTermsData, negativizeTerm } = require('../controllers/searchTermController');

//  middleware
router.use(authenticateToken);

// guardar los términos
router.post('/save', saveSearchTermData);

// obtener los términos
router.get('/', getSearchTermsData);

// negativizar un término
router.post('/negativize/:id', negativizeTerm);

module.exports = router;