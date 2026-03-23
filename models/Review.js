const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    memberSince: { type: String }, // e.g., "MEMBER FOR 6 MONTHS"
    rating: { type: Number, required: true, min: 1, max: 5 },
    story: { type: String, required: true },
    photoUrl: { type: String }, // Optional image URL
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
