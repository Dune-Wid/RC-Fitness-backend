const mongoose = require('mongoose');
const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  features: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Plan', planSchema);
