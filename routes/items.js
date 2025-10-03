const express = require('express');
const { addItem, getItemsByCategory, getItemById } = require('../controllers/itemController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/additem', authenticateToken, addItem); // Added auth
router.get('/category/:categoryId', getItemsByCategory);
router.get('/item/:id', getItemById);

module.exports = router;