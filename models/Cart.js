const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: "Item", required: true },
  quantity: { type: Number, default: 1 },
});

module.exports = mongoose.model("Cart", CartItemSchema);
