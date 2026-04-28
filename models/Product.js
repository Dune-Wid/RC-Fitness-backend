const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 150 },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0 },
  description: { type: String },
  images: [{ type: String }],
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Product', productSchema);
