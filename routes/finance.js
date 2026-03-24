const router = require('express').Router();
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');

// Plans
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) { res.status(500).json(err); }
});
router.post('/plans/add', async (req, res) => {
  const newPlan = new Plan(req.body);
  try {
    const savedPlan = await newPlan.save();
    res.status(200).json(savedPlan);
  } catch (err) { res.status(500).json(err); }
});
router.delete('/plans/delete/:id', async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(200).json("Plan deleted.");
  } catch (err) { res.status(500).json(err); }
});

router.put('/payments/update/:id', async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPayment);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) { res.status(500).json(err); }
});
router.post('/payments/add', async (req, res) => {
  const newPayment = new Payment(req.body);
  try {
    const savedPayment = await newPayment.save();
    res.status(200).json(savedPayment);
  } catch (err) { res.status(500).json(err); }
});
router.delete('/payments/delete/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json("Payment deleted.");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
