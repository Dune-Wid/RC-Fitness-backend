const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, minlength: 3, maxlength: 100 },
  description: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  endDate: { type: String, required: true },
  endTime: { type: String, required: true },
  type: { type: String, required: true, enum: ['Class', 'Workshop', 'Competition', 'Social'] },
  capacity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  trainer: { type: String, required: true },
  location: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Event', eventSchema);
