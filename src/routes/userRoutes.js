const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  refreshToken, 
  getCurrentUser 
} = require('../controllers/userController');
const { authenticateToken } = require('../middlewares/authMiddleware');

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/refresh', refreshToken);
router.post('/auth/user', authenticateToken, getCurrentUser);

module.exports = router;