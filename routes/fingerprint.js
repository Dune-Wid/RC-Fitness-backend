const express = require('express');
const router = express.Router();
const FingerPrintScan = require('../models/FingerPrintScan');
const User = require('../models/User');

// @route   POST api/fingerprint/scan
// @desc    Submit a new fingerprint scan (Simulated)
router.post('/scan', async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ msg: 'User ID is required' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Save the scan
        const newScan = new FingerPrintScan({
            userId,
            scannedAt: new Date()
        });

        await newScan.save();

        res.json({ msg: 'Scan successful', scan: newScan, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/fingerprint/identify
// @desc    Identify a user by their hardware fingerprintId (Credential ID)
router.post('/identify', async (req, res) => {
    try {
        const { fingerprintId } = req.body;

        if (!fingerprintId) {
            return res.status(400).json({ msg: 'Fingerprint ID is required' });
        }

        // Find user by fingerprintId
        const user = await User.findOne({ fingerprintId });
        if (!user) {
            return res.status(404).json({ msg: 'User not recognized. Please register fingerprint in profile.' });
        }

        // Log the scan
        const newScan = new FingerPrintScan({
            userId: user._id,
            scannedAt: new Date()
        });

        await newScan.save();

        res.json({ msg: 'Identification successful', scan: newScan, user });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/fingerprint/latest
// @desc    Get the most recent scan
router.get('/latest', async (req, res) => {
    try {
        const latestScan = await FingerPrintScan.findOne()
            .sort({ scannedAt: -1 })
            .populate('userId', ['fullName', 'nic', 'email', 'phone', 'membershipType', 'physicalStats', 'status']);
        
        if (!latestScan) {
            return res.status(404).json({ msg: 'No scans found' });
        }

        res.json(latestScan);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/fingerprint/users
// @desc    Get all users for selection in demo scanner
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('fullName nic');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
