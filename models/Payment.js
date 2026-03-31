const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  member: { type: String, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, required: true },
  duration: { type: String },
  email: { type: String },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Payment', paymentSchema);
