const express = require('express');
const { addItem, getItemsByCategory, getItemById } = require('../controllers/itemController');

const router = express.Router();

router.post('/additem', addItem);
router.get('/:categoryId', getItemsByCategory);
router.get('/:id', getItemById);

module.exports = router;