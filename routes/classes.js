const router = require('express').Router();
const Class = require('../models/Class');
const ClassBooking = require('../models/ClassBooking');
const jwt = require('jsonwebtoken');

// Middleware to verify user and extract ID
const verifyUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).send('Invalid Token'); }
};

// --- CLASS MANAGEMENT (Admin Only) ---
const verifyAdmin = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        if (verified.role !== 'admin') return res.status(403).send('Admin Only');
        req.user = verified;
        next();
    } catch (err) { res.status(400).send('Invalid Token'); }
};

// Get all classes
router.get('/', async (req, res) => {
    try {
        const classes = await Class.find().sort({ createdAt: -1 });
        res.json(classes);
    } catch (err) { res.status(500).send(err.message); }
});

// Create class
router.post('/', verifyAdmin, async (req, res) => {
    const newClass = new Class(req.body);
    try {
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) { res.status(400).send(err.message); }
});

// Update class
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedClass);
    } catch (err) { res.status(400).send(err.message); }
});

// Delete class
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await Class.findByIdAndDelete(req.params.id);
        res.json({ message: "Class deleted" });
    } catch (err) { res.status(500).send(err.message); }
});

// --- BOOKINGS (Members) ---

// Get all bookings (Admin sees all, Member sees theirs)
router.get('/bookings', verifyUser, async (req, res) => {
    try {
        const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
        const bookings = await ClassBooking.find(query).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) { res.status(500).send(err.message); }
});

// Book a class
router.post('/book', verifyUser, async (req, res) => {
    const booking = new ClassBooking({
        userId: req.user._id,
        className: req.body.className,
        time: req.body.time,
        studioLocation: req.body.studioLocation || 'Main Studio'
    });
    try {
        const savedBooking = await booking.save();
        res.status(201).json(savedBooking);
    } catch (err) { res.status(400).send(err.message); }
});

// Cancel a booking
router.delete('/bookings/:id', verifyUser, async (req, res) => {
    try {
        const booking = await ClassBooking.findById(req.params.id);
        if (!booking) return res.status(404).send('Booking not found');
        
        // Members can only delete their own bookings
        if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id) {
            return res.status(403).send('Unauthorized');
        }
        
        await ClassBooking.findByIdAndDelete(req.params.id);
        res.json({ message: "Booking cancelled" });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
