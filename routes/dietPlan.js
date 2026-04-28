const router = require('express').Router();
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
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

// Get user's diet plan
router.get('/me', verifyUser, async (req, res) => {
    try {
        const plan = await DietPlan.findOne({ userId: req.user._id });
        if (!plan) {
            const user = await User.findById(req.user._id);
            return res.status(404).json({ message: 'Diet plan not found', requested: user?.dietPlanRequested || false });
        }
        res.json(plan);
    } catch (err) { res.status(500).send(err.message); }
});

// Member: Request a diet plan
router.post('/request', verifyUser, async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.user._id, { dietPlanRequested: true });
        res.status(200).send('Diet plan requested successfully');
    } catch (err) { res.status(500).send(err.message); }
});

// Admin: Get all members and their diet plans
router.get('/all', verifyUser, async (req, res) => {
    try {
        // Fetch all non-admin users to show everyone in the gym
        const users = await User.find({ role: { $ne: 'admin' } }).select('-password');
        const dietPlans = await DietPlan.find();
        
        const mergedData = users.map(user => {
            const plan = dietPlans.find(dp => dp.userId.toString() === user._id.toString());
            return {
                user,
                dietPlan: plan || null
            };
        });
        
        res.json(mergedData);
    } catch (err) { res.status(500).send(err.message); }
});

// Admin: Assign or update diet plan
router.post('/assign', verifyUser, async (req, res) => {
    try {
        const { userId, goal, targetCalories, coachNote, dietDetails } = req.body;
        
        // Parse the simple text "dietDetails" into the complex "meals" array structure
        // This is a basic parser. It assumes lines like "Breakfast: 4 eggs"
        let meals = [];
        if (dietDetails) {
            const lines = dietDetails.split('\n').filter(l => l.trim() !== '');
            meals = lines.map((line, idx) => {
                const parts = line.split(':');
                const name = parts[0]?.trim() || `Meal ${idx + 1}`;
                const items = parts.length > 1 ? [parts[1].trim()] : [];
                return {
                    time: `Meal ${idx + 1}`,
                    name: name,
                    items: items,
                    cals: 0,
                    macros: { p: 0, c: 0, f: 0 },
                    macroPercents: { p: "33%", c: "33%", f: "33%" }
                };
            });
        } else {
            // Use req.body.meals if directly provided (for edit function)
            meals = req.body.meals || [];
        }

        const payload = {
            userId,
            goal: goal || 'Weight Loss',
            targetCalories: targetCalories || 2000,
            coachNote: coachNote || '',
            meals
        };

        const updated = await DietPlan.findOneAndUpdate(
            { userId },
            { $set: payload },
            { new: true, upsert: true }
        );
        
        // Clear request flag
        await User.findByIdAndUpdate(userId, { dietPlanRequested: false });
        
        res.json(updated);
    } catch (err) { res.status(400).send(err.message); }
});

// Admin: Delete diet plan
router.delete('/:id', verifyUser, async (req, res) => {
    try {
        await DietPlan.findByIdAndDelete(req.params.id);
        res.status(200).send('Diet plan deleted');
    } catch (err) { res.status(500).send(err.message); }
});

module.exports = router;
