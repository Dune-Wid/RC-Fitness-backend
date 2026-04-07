const router = require('express').Router();
const ClassSession = require('../models/ClassSession');

// GET all classes
router.get('/', async (req, res) => {
    try {
        const classes = await ClassSession.find().sort({ createdAt: -1 });
        res.status(200).json(classes);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE a new class (Admin basically)
router.post('/', async (req, res) => {
    try {
        const newClass = new ClassSession(req.body);
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (err) {
        res.status(500).json(err);
    }
});

// JOIN a class
router.put('/:id/join', async (req, res) => {
    try {
        const classSession = await ClassSession.findById(req.params.id);
        if (!classSession) return res.status(404).json("Class not found");

        if (!classSession.attendees.includes(req.body.userId)) {
            classSession.attendees.push(req.body.userId);
            await classSession.save();
            return res.status(200).json("Successfully joined the class");
        } else {
            return res.status(400).json("You have already joined this class");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});

// LEAVE a class
router.put('/:id/leave', async (req, res) => {
    try {
        const classSession = await ClassSession.findById(req.params.id);
        if (!classSession) return res.status(404).json("Class not found");

        classSession.attendees = classSession.attendees.filter(
            id => id.toString() !== req.body.userId
        );
        
        await classSession.save();
        res.status(200).json("Successfully left the class");
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
