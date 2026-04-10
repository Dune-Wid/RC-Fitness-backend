const mongoose = require('mongoose');

const ClassSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    time: { type: String, required: true },
    intensity: { type: String, required: true },
    intensityColor: { type: String, default: 'text-red-500' },
    bgImage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
