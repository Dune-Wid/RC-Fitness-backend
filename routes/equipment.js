const router = require('express').Router();
const Equipment = require('../models/Equipment');

// GET all equipment
router.get('/', async (req, res) => {
    try {
        const equipment = await Equipment.find().sort({ createdAt: -1 });
        res.status(200).json(equipment);
    } catch (err) {
        res.status(500).json(err);
    }
});

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
    } catch (err) {
        res.status(500).json(err);
    }
});

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
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router;
