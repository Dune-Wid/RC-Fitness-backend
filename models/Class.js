const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  type: { type: String, required: true },
  time: { type: String, required: true },
  name: { type: String, required: true },
  intensity: { type: String, required: true },
  intensityColor: { type: String, default: 'text-red-500' },
  bgImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Class', classSchema);
