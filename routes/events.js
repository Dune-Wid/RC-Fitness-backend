const router = require('express').Router();
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const EventRegistration = require('../models/EventRegistration');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/mailer');

// Security Middleware
const verifyAdmin = (req, res, next) => {
  const token = req.header('auth-token');
  if (!token) return res.status(401).send("Access Denied");
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (verified.role !== 'admin') return res.status(403).send("Admin Access Required");
    req.user = verified;
    next();
  } catch (err) { res.status(400).send("Invalid Token"); }
};

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
  const { date, time, endDate, endTime, trainer } = req.body;
  try {
    if (date && time) {
      if (endDate && endTime) {
        const startObj = new Date(`${date}T${time}`);
        const endObj = new Date(`${endDate}T${endTime}`);
        if (endObj <= startObj) {
          return res.status(400).json({ error: "End date/time must be after start date/time" });
        }
      }
    }

    if (trainer && date && time) {
      const duplicate = await Event.findOne({ trainer, date, time });
      if (duplicate) {
        return res.status(400).json({ error: "Trainer is already booked at this time" });
      }
    }

    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(200).json(savedEvent);

    // Background notifications for all members
    (async () => {
        try {
           const members = await User.find({ role: 'member', email: { $exists: true, $ne: null } });
           for (const member of members) {
               await sendEmail(member.email, emailTemplates.eventAdded(savedEvent, member));
           }
        } catch(e) { console.error('Error notifying members of new event:', e); }
    })();
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json(err);
  }
});
router.delete('/delete/:id', async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json("Event deleted.");
  } catch (err) { res.status(500).json(err); }
});
router.put('/update/:id', async (req, res) => {
  const { date, time, endDate, endTime, trainer } = req.body;
  try {
    if (date && time) {
      if (endDate && endTime) {
        const startObj = new Date(`${date}T${time}`);
        const endObj = new Date(`${endDate}T${endTime}`);
        if (endObj <= startObj) return res.status(400).json({ error: "End date/time must be after start date/time" });
      }
    }
    
    if (trainer && date && time) {
      const duplicate = await Event.findOne({
        _id: { $ne: req.params.id },
        trainer,
        date,
        time
      });
      if (duplicate) return res.status(400).json({ error: "Trainer is already booked at this time" });
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.status(200).json(updatedEvent);

    // Background notifications for all members
    (async () => {
        try {
           const members = await User.find({ role: 'member', email: { $exists: true, $ne: null } });
           for (const member of members) {
               await sendEmail(member.email, emailTemplates.eventUpdated(updatedEvent, member));
           }
        } catch(e) { console.error('Error notifying members of updated event:', e); }
    })();
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json(err);
  }
});

// --- EVENT REGISTRATIONS ---

router.post('/register/:id', async (req, res) => {
  const { userName, userEmail } = req.body;
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json("Event not found");

    // Overbooking check
    const currentRegs = await EventRegistration.countDocuments({ eventId: event._id });
    if (currentRegs >= event.capacity) {
      return res.status(400).json({ error: "Event has reached maximum capacity" });
    }

    // Registration closes 30 minutes before start
    if (event.date && event.time) {
      const eventStart = new Date(`${event.date}T${event.time}`);
      const thirtyMinsBefore = new Date(eventStart.getTime() - 30 * 60000);
      const now = new Date();
      if (now >= thirtyMinsBefore) {
        return res.status(400).json({ error: "Registration is closed (closes 30 minutes before start)" });
      }
    }

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

// --- ANNOUNCEMENT ROUTES ---
router.get('/announcements/all', async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ createdAt: -1 });
    res.json(announcements);
  } catch (err) { res.status(500).json(err); }
});

router.post('/announcements/add', verifyAdmin, async (req, res) => {
  try {
    const newAnn = new Announcement(req.body);
    const saved = await newAnn.save();
    res.status(200).json(saved);
  } catch (err) { res.status(500).json(err); }
});

router.delete('/announcements/delete/:id', verifyAdmin, async (req, res) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.status(200).json("Announcement deleted.");
  } catch (err) { res.status(500).json(err); }
});

module.exports = router;
