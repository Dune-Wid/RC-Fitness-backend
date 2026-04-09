const mongoose = require('mongoose');

<<<<<<< Updated upstream
const ClassBookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    className: { type: String, required: true },
    time: { type: String, required: true },
    studioLocation: { type: String, default: 'Main Studio' }
}, { timestamps: true });

module.exports = mongoose.model('ClassBooking', ClassBookingSchema);
=======
const classBookingSchema = new mongoose.Schema({
  className: { type: String, required: true },
  time: { type: String, required: true },
  studioLocation: { type: String, default: 'Main Studio' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ClassBooking', classBookingSchema);
>>>>>>> Stashed changes
