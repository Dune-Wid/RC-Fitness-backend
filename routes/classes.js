const router = require('express').Router();
const ClassBooking = require('../models/ClassBooking');
<<<<<<< Updated upstream

// Get all booked classes
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await ClassBooking.find().sort({ createdAt: 1 });
=======
const Class = require('../models/Class');

// --- CLASSES CRUD ---

// Get all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find().sort({ createdAt: -1 });
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Add new class
router.post('/', async (req, res) => {
    const newClass = new Class(req.body);
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Update class
router.put('/:id', async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedClass);
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete class
router.delete('/:id', async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.status(200).json("Class has been deleted...");
    } catch (err) {
        res.status(500).json(err);
    }
});

// --- CLASS BOOKINGS ---

// Get all class bookings
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await ClassBooking.find().sort({ createdAt: -1 });
>>>>>>> Stashed changes
        res.status(200).json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

<<<<<<< Updated upstream
// Book a class
router.post('/book', async (req, res) => {
    try {
        const newBooking = new ClassBooking(req.body);
=======
// Add new class booking
router.post('/book', async (req, res) => {
    const newBooking = new ClassBooking(req.body);
    try {
>>>>>>> Stashed changes
        const savedBooking = await newBooking.save();
        res.status(201).json(savedBooking);
    } catch (err) {
        res.status(500).json(err);
    }
});

<<<<<<< Updated upstream
// Cancel a booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        await ClassBooking.findByIdAndDelete(req.params.id);
        res.status(200).json("Booking canceled successfully.");
=======
// Delete class booking
router.delete('/bookings/:id', async (req, res) => {
    try {
        await ClassBooking.findByIdAndDelete(req.params.id);
        res.status(200).json("Booking has been cancelled...");
>>>>>>> Stashed changes
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
