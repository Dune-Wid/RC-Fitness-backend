const router = require('express').Router();
const PR = require('../models/PR');
const jwt = require('jsonwebtoken');

const verifyUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Access Denied');
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) { res.status(400).send('Invalid Token'); }
};

// Get all PRs for the logged in user
router.get('/', verifyUser, async (req, res) => {
    try {
        const prs = await PR.find({ userId: req.user._id }).sort({ date: -1 });
        res.json(prs);
    } catch (err) { res.status(500).send(err.message); }
});

// Log a new PR
router.post('/log', verifyUser, async (req, res) => {
    const pr = new PR({
        userId: req.user._id,
        liftName: req.body.liftName,
        weight: req.body.weight,
        unit: req.body.unit || 'kg'
    });
    try {
        const savedPR = await pr.save();
        res.status(201).json(savedPR);
    } catch (err) { res.status(400).send(err.message); }
});

// Delete a PR
router.delete('/:id', verifyUser, async (req, res) => {
    try {
        const pr = await PR.findById(req.params.id);
        if (!pr) return res.status(404).send('PR not found');
        if (pr.userId.toString() !== req.user._id) return res.status(403).send('Unauthorized');
        
        await PR.findByIdAndDelete(req.params.id);
        res.json({ message: "PR deleted" });
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
