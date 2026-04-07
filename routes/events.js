const router = require('express').Router();
const Event = require('../models/Event');
const EventRegistration = require('../models/EventRegistration');
const nodemailer = require('nodemailer');

router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) { res.status(500).json(err); }
});

router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
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

// --- EVENT REGISTRATIONS ---

router.post('/register/:id', async (req, res) => {
  const { userName, userEmail } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json("Event not found");

    const newRegistration = new EventRegistration({
      eventId: event._id,
      eventTitle: event.title,
      userName,
      userEmail
    });
    const savedReg = await newRegistration.save();

    // Send Email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Registration Confirmed: ${event.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
            <h2 style="color: #dc2626; text-align: center;">RC FITNESS EVENT CONFIRMATION</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Your spot has been reserved for <strong>${event.title}</strong>!</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${event.time}</p>
              <p style="margin: 5px 0;"><strong>Location:</strong> ${event.location || 'RC Fitness Center'}</p>
            </div>
            <p style="text-align: center; color: #666; font-size: 12px;">See you there! Get ready to crush it! 💪</p>
          </div>
        `
      };

      try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ registration: savedReg, emailSent: true });
      } catch (emailError) {
        console.error("Email Error:", emailError);
        res.status(200).json({ registration: savedReg, emailSent: false, error: "Failed to send confirmation email" });
      }
    } else {
      res.status(200).json({ registration: savedReg, emailSent: false, error: "Email credentials missing" });
    }

  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/registrations/:id', async (req, res) => {
  try {
    const registrations = await EventRegistration.find({ eventId: req.params.id }).sort({ registrationDate: -1 });
    res.json(registrations);
  } catch (err) { res.status(500).json(err); }
});
module.exports = router;
