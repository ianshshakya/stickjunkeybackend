const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist
} = require('../controllers/wishlistController');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getWishlist);
router.post('/:itemId', addToWishlist);
router.delete('/:itemId', removeFromWishlist);
router.get('/check/:itemId', checkWishlistItem); // New endpoint
router.delete('/clear', clearWishlist); // New endpoint

module.exports = router;