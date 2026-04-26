const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  type: { type: String, enum: ['code', 'sale'], default: 'code' },
  code: { type: String, unique: true, sparse: true }, // For 'code' type
  title: { type: String }, // For 'sale' type
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountValue: { type: Number, required: true },
  userLimit: { type: Number }, // For 'code' type
  usageCount: { type: Number, default: 0 }, // For 'code' type
  startDate: { type: Date }, // For 'sale' type
  endDate: { type: Date },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Promotion', promotionSchema);
