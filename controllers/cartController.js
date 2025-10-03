
const mongoose = require('mongoose');
const Item = require('../models/Item');
const Cart = require('../models/Cart');

const getCart = async (req, res) => {
    try {
        const cartItems = await Cart.find({ user: req.user.userId }).populate('item');
        const itemData = cartItems.map(cart => cart.item);


        res.json(itemData);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const addToCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity = 1 } = req.body;

        // Check if item exists
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ message: "Item not found" });
        }

        // Look for existing cart entry for this user + item
        let cartItem = await Cart.findOne({
            user: new mongoose.Types.ObjectId(req.user.userId),
            item: new mongoose.Types.ObjectId(itemId),
        });

        if (cartItem) {
            // If item already in cart → update quantity
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // If new item → create cart record
            cartItem = new Cart({
                user: req.user.userId,
                item: itemId,
                quantity,
            });
            await cartItem.save();
        }

        // Populate item details before sending response
        await cartItem.populate("item");

        res.status(201).json({
            message: "Item added to cart",
            cartItem,
        });
    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};

const updateCartItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1' });
        }

        const cartItem = await CartItem.findOneAndUpdate(
            { user: req.user.userId, item: itemId },
            { quantity },
            { new: true }
        ).populate('item');

        if (!cartItem) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Cart updated', cartItem });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { itemId } = req.params;
        const result = await CartItem.findOneAndDelete({ user: req.user.userId, item: itemId });

        if (!result) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        res.json({ message: 'Item removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart };