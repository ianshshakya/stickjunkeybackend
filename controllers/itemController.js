const Item = require('../models/Item');

const addItem = async (req, res) => {
    try {
        const { name, description, stockQuantity, price, category, imageUrl } = req.body;
        const existingItem = await Item.findOne({ name });
        if (existingItem) {
            return res.status(400).json({ message: 'Item already exists' });
        }
        const item = new Item({ name, description, stockQuantity, category, price, imageUrl });
        await item.save();
        res.status(201).json({ message: 'Item added successfully', });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getItemsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const items = await Item.find({ category: categoryId });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getItemById = async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(item);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { addItem, getItemsByCategory, getItemById };