const mongoose = require('mongoose');

const ClassBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    className: { type: String, required: true },
    time: { type: String, required: true },
    studioLocation: { type: String, default: 'Main Studio' },
}, { timestamps: true });

module.exports = mongoose.model('ClassBooking', ClassBookingSchema);
