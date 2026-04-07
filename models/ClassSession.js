const mongoose = require('mongoose');

const ClassSessionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true }, // 'CORE', 'ENDURANCE', 'FULL BODY', 'POWER'
    startTime: { type: String, required: true }, // e.g. '08:00 AM'
    endTime: { type: String, required: true }, // e.g. '09:00 AM'
    intensity: { type: String, required: true }, // 'HIGH', 'EXTREME', 'MEDIUM', 'VERY HIGH'
    day: { type: String }, // e.g. 'TODAY'
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
