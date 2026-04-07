const router = require('express').Router();
const Equipment = require('../models/Equipment');

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// GET all equipment
=======
// Get all equipment
>>>>>>> Stashed changes
=======
// Get all equipment
>>>>>>> Stashed changes
router.get('/', async (req, res) => {
    try {
        const equipment = await Equipment.find().sort({ createdAt: -1 });
        res.status(200).json(equipment);
    } catch (err) {
        res.status(500).json(err);
    }
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// CREATE new equipment
router.post('/', async (req, res) => {
    try {
        // Assume lastServiceDate is provided from client or defaults to today
        const lastServiceDate = req.body.lastServiceDate ? new Date(req.body.lastServiceDate) : new Date();
        const nextServiceDate = new Date(lastServiceDate);
        nextServiceDate.setMonth(nextServiceDate.getMonth() + 4);

        const newEquipment = new Equipment({
            ...req.body,
            lastServiceDate,
            nextServiceDate // handled by pre-save slightly, but good to ensure it's explicitly set if needed
        });

        const savedEquipment = await newEquipment.save();
        res.status(201).json(savedEquipment);
=======
// Add new equipment
router.post('/', async (req, res) => {
    try {
        const newEq = new Equipment(req.body);
        const savedEq = await newEq.save();
        res.status(201).json(savedEq);
>>>>>>> Stashed changes
=======
// Add new equipment
router.post('/', async (req, res) => {
    const newEquipment = new Equipment(req.body);
    try {
        const savedEquipment = await newEquipment.save();
        res.status(201).json(savedEquipment);
>>>>>>> Stashed changes
    } catch (err) {
        res.status(500).json(err);
    }
});

<<<<<<< Updated upstream
<<<<<<< Updated upstream
// DELETE equipment
router.delete('/:id', async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Equipment has been deleted..." });
    } catch (err) {
        res.status(500).json(err);
    }
});

// MARK AS FIXED or SCHEDULE SERVICE
router.put('/:id/service', async (req, res) => {
    try {
        const equipment = await Equipment.findById(req.params.id);
        if (!equipment) return res.status(404).json("Equipment not found");
        
        let updateData = {};
        if (req.body.action === 'MARK_FIXED') {
            updateData.status = 'WORKING';
            const today = new Date();
            updateData.lastServiceDate = today;
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 4);
            updateData.nextServiceDate = nextDate;
        } else if (req.body.action === 'SCHEDULE_SERVICE') {
            updateData.status = 'UNDER MAINTAINING';
        }

        const updatedEquipment = await Equipment.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );
        res.status(200).json(updatedEquipment);
=======
// Update equipment status
router.put('/:id', async (req, res) => {
    try {
        const updatedEq = await Equipment.findByIdAndUpdate(
=======
// Update equipment status
router.put('/:id', async (req, res) => {
    try {
        const updatedEquipment = await Equipment.findByIdAndUpdate(
>>>>>>> Stashed changes
            req.params.id,
            { $set: req.body },
            { new: true }
        );
<<<<<<< Updated upstream
        res.status(200).json(updatedEq);
=======
        res.status(200).json(updatedEquipment);
>>>>>>> Stashed changes
    } catch (err) {
        res.status(500).json(err);
    }
});

// Delete equipment
router.delete('/:id', async (req, res) => {
    try {
        await Equipment.findByIdAndDelete(req.params.id);
<<<<<<< Updated upstream
        res.status(200).json("Equipment deleted successfully.");
>>>>>>> Stashed changes
=======
        res.status(200).json("Equipment has been deleted...");
>>>>>>> Stashed changes
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
