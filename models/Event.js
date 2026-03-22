const mongoose = require('mongoose');
const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  type: { type: String, required: true },
  location: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Event', eventSchema);
