const mongoose = require('mongoose');

const PRSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    liftName: { type: String, required: true },
    weight: { type: Number, required: true },
    unit: { type: String, default: 'kg' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PR', PRSchema);
