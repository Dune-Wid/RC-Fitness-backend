const router = require('express').Router();
const Equipment = require('../models/Equipment');
const jwt = require('jsonwebtoken');

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

// Get all equipment
router.get('/', async (req, res) => {
    try {
        const equipment = await Equipment.find().sort({ createdAt: -1 });
        res.json(equipment);
    } catch (err) { res.status(500).send(err.message); }
});

// Create equipment
router.post('/', verifyAdmin, async (req, res) => {
    const eq = new Equipment(req.body);
    try {
        const savedEq = await eq.save();
        res.status(201).json(savedEq);
    } catch (err) { res.status(400).send(err.message); }
});

// Update equipment
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const updatedEq = await Equipment.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedEq);
    } catch (err) { res.status(400).send(err.message); }
});

// Delete equipment
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.json({ message: "Equipment deleted" });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
