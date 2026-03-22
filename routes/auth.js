const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// --- 1. EMAIL CONFIGURATION ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'groupmail404@gmail.com', 
        pass: 'uoxscxmaetwbycts' 
    }
});

// --- 2. SECURITY MIDDLEWARE ---
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

// --- 3. ROUTES ---

// LOGIN (Public)
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send('Email not found');
        
        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).send('Invalid password');

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ token, role: user.role, id: user._id, fullName: user.fullName });
    } catch (err) { res.status(500).send(err.message); }
});

// REGISTER (Members & Staff)
router.post('/register', verifyAdmin, async (req, res) => {
    try {
        const emailExist = await User.findOne({ email: req.body.email });
        if (emailExist) return res.status(400).send('Email already exists');

        const generatedPassword = Math.random().toString(36).slice(-8);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(generatedPassword, salt);

        let physicalData = null;
        if (req.body.weight && req.body.height) {
            const w = parseFloat(req.body.weight);
            const h = parseFloat(req.body.height) / 100;
            physicalData = {
                weight: req.body.weight,
                height: req.body.height,
                bmi: (w / (h * h)).toFixed(2),
                chest: req.body.chest || 0,
                bicep: req.body.bicep || 0
            };
        }

        const user = new User({
            ...req.body,
            password: hashedPassword,
            physicalStats: physicalData
        });

        await user.save();

        // AUTOMATED WELCOME EMAIL
        const mailOptions = {
            from: '"RC Fitness" <groupmail404@gmail.com>',
            to: user.email,
            subject: 'Welcome to RC Fitness - Account Details',
            html: `<div style="background-color: #080808; color: #fff; padding: 40px; font-family: sans-serif; text-align: center;">
                    <h1 style="color: #dc2626;">RC FITNESS</h1>
                    <p>Your password is: <b>${generatedPassword}</b></p>
                   </div>`
        };
        await transporter.sendMail(mailOptions);

        res.status(201).json({ message: "Success" });
    } catch (err) { res.status(400).send(err.message); }
});

// DASHBOARD STATS
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const totalMembers = await User.countDocuments({ role: 'member' });
        const activeMembers = await User.countDocuments({ role: 'member', status: 'Active' });
        const totalStaff = await User.countDocuments({ role: 'staff' });
        res.json({ totalMembers, activeMembers, totalStaff, revenue: totalMembers * 5000 });
    } catch (err) { res.status(500).send(err.message); }
});

// FETCH LISTS
router.get('/all', verifyAdmin, async (req, res) => {
    try { res.json(await User.find({ role: 'member' }).sort({ createdAt: -1 })); } 
    catch (err) { res.status(500).send(err.message); }
});

router.get('/staff-all', verifyAdmin, async (req, res) => {
    try { res.json(await User.find({ role: 'staff' }).sort({ createdAt: -1 })); } 
    catch (err) { res.status(500).send(err.message); }
});

// UPDATE & DELETE
router.put('/update/:id', verifyAdmin, async (req, res) => {
    try {
        const updated = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updated);
    } catch (err) { res.status(400).send(err.message); }
});

router.delete('/delete/:id', verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: "Deleted" });
    } catch (err) { res.status(500).send(err.message); }
});

// PROFILE (For Members)
router.get('/me', async (req, res) => {
    try {
        const token = req.header('auth-token');
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        res.json(await User.findById(verified._id));
    } catch (err) { res.status(401).send('Unauthorized'); }
});

module.exports = router;