const router = require('express').Router();
const ClassBooking = require('../models/ClassBooking');

// Get all booked classes
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await ClassBooking.find().sort({ createdAt: 1 });
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Book a class
router.post('/book', async (req, res) => {
    try {
        const newBooking = new ClassBooking(req.body);
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        await ClassBooking.findByIdAndDelete(req.params.id);
        res.status(200).json("Booking canceled successfully.");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
