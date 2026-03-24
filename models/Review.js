const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
<<<<<<< Updated upstream
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    memberSince: { type: String }, // e.g., "MEMBER FOR 6 MONTHS"
    rating: { type: Number, required: true, min: 1, max: 5 },
    story: { type: String, required: true },
    photoUrl: { type: String }, // Optional image URL
=======
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, default: 'Member' },
    membershipDuration: { type: String, default: 'MEMBER FOR 1 MONTH' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    story: { type: String, required: true },
    imageBase64: { type: String }, // Storing base64 for simplicity in rapid prototype
    dateString: { type: String }
>>>>>>> Stashed changes
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
