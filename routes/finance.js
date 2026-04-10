const Plan = require('../models/Plan');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Payroll = require('../models/Payroll');
const Expense = require('../models/Expense');
const JobRole = require('../models/JobRole');
const jwt = require('jsonwebtoken');
const router = require('express').Router();
const { sendEmail, emailTemplates } = require('../utils/mailer');

// Security Middleware
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

// Plans (public - so Membership page can fetch without auth)
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find();
    res.json(plans);
  } catch (err) { res.status(500).json(err); }
});

router.post('/plans/add', verifyAdmin, async (req, res) => {
  const newPlan = new Plan(req.body);
  try {
    const savedPlan = await newPlan.save();
    res.status(200).json(savedPlan);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/plans/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Plan.findByIdAndDelete(req.params.id);
    res.status(200).json("Plan deleted.");
  } catch (err) { res.status(500).json(err); }
});

router.put('/plans/update/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedPlan);
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

router.put('/payments/update/:id', verifyAdmin, async (req, res) => {
  try {
    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Send payment update email notification
    if (updatedPayment && updatedPayment.email) {
      sendEmail(updatedPayment.email, emailTemplates.paymentUpdated(updatedPayment)).catch(console.error);
    }

    res.status(200).json(updatedPayment);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/payments/add', verifyAdmin, async (req, res) => {
  const newPayment = new Payment(req.body);
  try {
    const savedPayment = await newPayment.save();
    let emailStatus = { sent: false, error: null };

    // Send Invoice/Confirmation Email
    if (req.body.email) {
      const result = await sendEmail(req.body.email, emailTemplates.paymentAdded(savedPayment));
      emailStatus = result;
    } else {
      emailStatus.error = "No Email mapped to this Member. Did you match the name exactly?";
    }

    // --- AUTOMATION: Update Member Profile ---
    try {
      const memberEmail = req.body.email;
      const memberName = req.body.member;
      const user = await User.findOne({ $or: [{ email: memberEmail }, { fullName: memberName }] });

      if (user) {
        const start = new Date(req.body.date);
        let daysToAdd = 30;
        const durationText = req.body.duration || '1 Month';
        if (durationText.toLowerCase().includes('3')) daysToAdd = 90;
        else if (durationText.toLowerCase().includes('6')) daysToAdd = 180;
        else if (durationText.toLowerCase().includes('12')) daysToAdd = 365;

        user.membershipExpiry = new Date(start.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        user.membershipType = durationText;
        user.treadmillAccess = req.body.treadmillAccess === true;
        user.status = 'Active';
        await user.save();
      }
    } catch (automationErr) {
      console.error("Automation error (updating user):", automationErr);
    }

    const responseObj = savedPayment.toObject();
    responseObj.emailSent = emailStatus.sent;
    responseObj.emailError = emailStatus.error;

    res.status(200).json(responseObj);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/payments/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json("Payment deleted.");
  } catch (err) { res.status(500).json(err); }
});

// --- PAYROLL ROUTES ---
router.get('/payroll', verifyAdmin, async (req, res) => {
  try {
    const payroll = await Payroll.find().sort({ createdAt: -1 });
    res.json(payroll);
  } catch (err) { res.status(500).json(err); }
});

router.post('/payroll/add', verifyAdmin, async (req, res) => {
  try {
    const newPayroll = new Payroll(req.body);
    const saved = await newPayroll.save();
    res.status(200).json(saved);
  } catch (err) { res.status(500).json(err); }
});

// --- EXPENSE ROUTES ---
router.get('/expenses', verifyAdmin, async (req, res) => {
  try {
    const expenses = await Expense.find().sort({ date: -1 });
    res.json(expenses);
  } catch (err) { res.status(500).json(err); }
});

router.post('/expenses/add', verifyAdmin, async (req, res) => {
  try {
    const newExpense = new Expense(req.body);
    const saved = await newExpense.save();
    res.status(200).json(saved);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/expenses/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Expense.findByIdAndDelete(req.params.id);
    res.status(200).json("Expense deleted.");
  } catch (err) { res.status(500).json(err); }
});

// --- JOB ROLE ROUTES ---
router.get('/job-roles', verifyAdmin, async (req, res) => {
  try {
    let roles = await JobRole.find().sort({ baseSalary: -1 });
    if (roles.length === 0) {
       const defaultRoles = [
           { roleName: 'Manager', baseSalary: 100000 },
           { roleName: 'Trainer', baseSalary: 60000 },
           { roleName: 'Receptionist', baseSalary: 45000 },
           { roleName: 'Cleaner', baseSalary: 35000 }
       ];
       await JobRole.insertMany(defaultRoles);
       roles = await JobRole.find().sort({ baseSalary: -1 });
    }
    res.json(roles);
  } catch (err) { res.status(500).json(err); }
});

router.post('/job-roles/add', verifyAdmin, async (req, res) => {
  try {
     const role = new JobRole(req.body);
     const saved = await role.save();
     res.status(200).json(saved);
  } catch (err) { res.status(500).json(err); }
});

router.put('/job-roles/update/:id', verifyAdmin, async (req, res) => {
  try {
      const updated = await JobRole.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
      res.json(updated);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/job-roles/delete/:id', verifyAdmin, async (req, res) => {
  try {
     await JobRole.findByIdAndDelete(req.params.id);
     res.json("Role deleted.");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
