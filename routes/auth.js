const express = require('express');
const { googleAuth, signup, checkAuth, signin, signout, getMe } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/google', googleAuth);
router.post('/signup', signup);
router.get('/check', checkAuth);
router.post('/signin', signin);
router.get('/me', authenticateToken, getMe)
router.post('/signout', signout);


module.exports = router;