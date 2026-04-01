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

router.put('/plans/update/:id', async (req, res) => {
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

const nodemailer = require('nodemailer');

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
    let emailStatus = { sent: false, error: null };

    // Send Invoice Email
    if (req.body.email) {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        emailStatus.error = "Email failed: Missing EMAIL_USER and EMAIL_PASS environment variables. Add them to Vercel/Local env.";
      } else {
        let transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          }
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: 'Invoice for RC Fitness Gym Payment',
          html: `
            <div style="font-family: Arial, sans-serif; background: #fff; padding: 20px; color: #000; border: 1px solid #ddd; border-radius: 8px; max-width: 400px; margin: auto;">
              <h2 style="text-align: center; color: #333;">RC FITNESS GYM</h2>
              <hr style="border:0; border-top:1px solid #ddd; margin: 15px 0;" />
              <p><strong>Member:</strong> ${savedPayment.member}</p>
              <p><strong>Date:</strong> ${savedPayment.date}</p>
              <p><strong>Plan:</strong> ${savedPayment.duration}</p>
              <p><strong>Status:</strong> ${savedPayment.status}</p>
              <h3 style="text-align: center; margin-top: 20px;">Amount: LKR ${savedPayment.amount}</h3>
              <hr style="border:0; border-top:1px solid #ddd; margin: 15px 0;" />
              <p style="text-align: center; font-size: 12px; color: #777;">Thank you 💪</p>
            </div>
          `
        };

        try {
          await transporter.sendMail(mailOptions);
          emailStatus.sent = true;
        } catch (error) {
          console.error("Email send error:", error);
          emailStatus.error = "Email rejected by Server (Check Gmail App Passwords permissions). Error: " + error.message;
        }
      }
    } else {
      emailStatus.error = "No Email mapped to this Member. Did you match the name exactly?";
    }

    const responseObj = savedPayment.toObject();
    responseObj.emailSent = emailStatus.sent;
    responseObj.emailError = emailStatus.error;

    res.status(200).json(responseObj);
  } catch (err) { res.status(500).json(err); }
});
router.delete('/payments/delete/:id', async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.status(200).json("Payment deleted.");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
