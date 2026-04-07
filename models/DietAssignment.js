const mongoose = require('mongoose');

const DietAssignmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    memberName: { type: String }, // Storing name for easier display if needed
    goal: { type: String, required: true, enum: ['weight_loss', 'maintenance', 'muscle_gain'] },
    dietDetails: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DietAssignment', DietAssignmentSchema);
