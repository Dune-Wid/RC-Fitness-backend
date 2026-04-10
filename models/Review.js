const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    name: { type: String, required: true },
    membershipDuration: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    story: { type: String, required: true },
    imageBase64: { type: String },
    dateString: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
