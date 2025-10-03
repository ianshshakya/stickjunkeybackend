const Item = require('../models/Item');

const addItem = async (req, res) => {
  try {
    const { name, description, stockQuantity, price, category, imageUrl } = req.body;

    // Validate required fields
    if (!name || !description || !stockQuantity || !price || !category || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingItem = await Item.findOne({ name });
    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already exists'
      });
    }

    const item = new Item({
      name,
      description,
      stockQuantity: parseInt(stockQuantity),
      category,
      price: parseFloat(price),
      imageUrl
    });

    await item.save();

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: item
    });
  } catch (error) {
    console.error('Add item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding item',
      error: error.message
    });
  }
};

const getItemsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const items = await Item.find({ category: categoryId });
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items',
      error: error.message
    });
  }
};

const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching item',
      error: error.message
    });
  }
};

/**
 * Get all items with pagination (Admin)
 * @route GET /api/admin/items
 * @access Private/Admin
 */
const getAllItems = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Item.countDocuments(filter);

    res.json({
      success: true,
      data: items,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total
      }
    });
  } catch (error) {
    console.error('Get all items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching items',
      error: error.message
    });
  }
};

/**
 * Update item
 * @route PUT /api/admin/items/:id
 * @access Private/Admin
 */
const updateItem = async (req, res) => {
  try {
    const { name, description, stockQuantity, price, category, imageUrl } = req.body;

    const item = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        stockQuantity: parseInt(stockQuantity),
        price: parseFloat(price),
        category,
        imageUrl
      },
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item updated successfully',
      data: item
    });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating item',
      error: error.message
    });
  }
};

/**
 * Delete item
 * @route DELETE /api/admin/items/:id
 * @access Private/Admin
 */
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found'
      });
    }

    res.json({
      success: true,
      message: 'Item deleted successfully'
    });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting item',
      error: error.message
    });
  }
};

module.exports = {
  addItem,
  getItemsByCategory,
  getItemById,
  getAllItems,
  updateItem,
  deleteItem
};