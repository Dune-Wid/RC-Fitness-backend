const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    id_tag: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['WORKING', 'UNDER MAINTAINING'], default: 'WORKING' },
    daysUntilService: { type: Number, default: 30 }
}, { timestamps: true });

module.exports = mongoose.model('Equipment', EquipmentSchema);
