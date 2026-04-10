const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: 'General' }, // e.g., "Event", "Update", "Offer"
    image: { type: String },
    date: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
