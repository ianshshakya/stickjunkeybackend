const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { getCart, addToCart, updateCartItem, removeFromCart } = require('../controllers/cartController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getCart);
router.post('/:itemId', addToCart);
router.put('/:itemId', updateCartItem);
router.delete('/:itemId', removeFromCart);

module.exports = router;