const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
    equipmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    area: { type: String, required: true },
    status: { type: String, enum: ['WORKING', 'UNDER MAINTAINING'], default: 'WORKING' },
    lastServiceDate: { type: Date, required: true },
    nextServiceDate: { type: Date, required: true }
}, { timestamps: true });

// Pre-save middleware to automatically calculate nextServiceDate if lastServiceDate is provided/updated
EquipmentSchema.pre('save', function(next) {
    if (this.isModified('lastServiceDate')) {
        const nextDate = new Date(this.lastServiceDate);
        nextDate.setMonth(nextDate.getMonth() + 4);
        this.nextServiceDate = nextDate;
    }
    next();
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
