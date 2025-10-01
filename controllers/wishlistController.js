const Wishlist = require('../models/Wishlist');
const Item = require('../models/Item');

/**
 * Get user's wishlist
 * @route GET /api/wishlist
 * @access Private
 */
const getWishlist = async (req, res) => {
  try {
    const wishlistItems = await Wishlist.find({ user: req.user.userId })
      .populate('item');
    
    res.json({
      success: true,
      data: wishlistItems.map(w => w.item),
      count: wishlistItems.length
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching wishlist', 
      error: error.message 
    });
  }
};

/**
 * Add item to wishlist
 * @route POST /api/wishlist/:itemId
 * @access Private
 */
const addToWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    // Check if item exists
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found' 
      });
    }

    // Check if already in wishlist
    const existingWishlistItem = await Wishlist.findOne({ 
      user: req.user.userId, 
      item: itemId 
    });
    
    if (existingWishlistItem) {
      return res.status(400).json({ 
        success: false,
        message: 'Item already in wishlist' 
      });
    }

    // Add to wishlist
    const wishlistItem = new Wishlist({
      user: req.user.userId,
      item: itemId
    });
    
    await wishlistItem.save();
    await wishlistItem.populate('item');

    res.status(201).json({
      success: true,
      message: 'Item added to wishlist successfully',
      data: wishlistItem.item
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while adding to wishlist', 
      error: error.message 
    });
  }
};

/**
 * Remove item from wishlist
 * @route DELETE /api/wishlist/:itemId
 * @access Private
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { itemId } = req.params;

    const result = await Wishlist.findOneAndDelete({ 
      user: req.user.userId, 
      item: itemId 
    });

    if (!result) {
      return res.status(404).json({ 
        success: false,
        message: 'Item not found in wishlist' 
      });
    }

    res.json({
      success: true,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while removing from wishlist', 
      error: error.message 
    });
  }
};

/**
 * Check if item is in user's wishlist
 * @route GET /api/wishlist/check/:itemId
 * @access Private
 */
const checkWishlistItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const wishlistItem = await Wishlist.findOne({
      user: req.user.userId,
      item: itemId
    });

    res.json({
      success: true,
      data: {
        isInWishlist: !!wishlistItem
      }
    });
  } catch (error) {
    console.error('Check wishlist item error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid item ID'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Server error while checking wishlist', 
      error: error.message 
    });
  }
};

/**
 * Clear entire wishlist
 * @route DELETE /api/wishlist/clear
 * @access Private
 */
const clearWishlist = async (req, res) => {
  try {
    const result = await Wishlist.deleteMany({ 
      user: req.user.userId 
    });

    res.json({
      success: true,
      message: `Wishlist cleared successfully. ${result.deletedCount} items removed.`
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while clearing wishlist', 
      error: error.message 
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlistItem,
  clearWishlist
};