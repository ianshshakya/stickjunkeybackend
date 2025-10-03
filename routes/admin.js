const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const {
  getAllItems,
  updateItem,
  deleteItem
} = require('../controllers/itemController');
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats
} = require('../controllers/orderController');

const router = express.Router();

// Admin middleware (check if user is admin)
const requireAdmin = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.userId);
    
    if (!user || !user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while verifying admin access'
    });
  }
};

// Apply auth and admin middleware to all routes
router.use(authenticateToken, requireAdmin);

// Dashboard routes
router.get('/dashboard', getDashboardStats);

// Item management routes
router.get('/items', getAllItems);
router.put('/items/:id', updateItem);
router.delete('/items/:id', deleteItem);

// Order management routes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

module.exports = router;