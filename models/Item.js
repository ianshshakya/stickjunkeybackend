const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  stockQuantity: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  imageUrl: { 
    type: String, 
    required: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Item', itemSchema);