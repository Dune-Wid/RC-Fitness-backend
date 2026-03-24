const router = require('express').Router();
const Event = require('../models/Event');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) { res.status(500).json(err); }
});
router.post('/add', async (req, res) => {
  const newEvent = new Event(req.body);
  try {
    const savedEvent = await newEvent.save();
    res.status(200).json(savedEvent);
  } catch (err) { res.status(500).json(err); }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json("Event deleted.");
  } catch (err) { res.status(500).json(err); }
});
router.put('/update/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedEvent);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
