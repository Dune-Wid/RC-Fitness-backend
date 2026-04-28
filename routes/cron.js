const router = require('express').Router();
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('../utils/mailer');

/**
 * GET /api/cron/membership-reminder
 * Call this endpoint daily (e.g., via a cron service like cron-job.org or Vercel Cron).
 * It scans all members for expiring memberships and sends reminder emails.
 */
router.get('/membership-reminder', async (req, res) => {
    try {
        const now = new Date();

        // Find members whose membership expires in exactly 3 days or 1 day
        const members = await User.find({ role: 'member', membershipExpiry: { $gt: now } });

        const reminders = [];

        for (const user of members) {
            if (!user.email || !user.membershipExpiry) continue;

            const msLeft = new Date(user.membershipExpiry).getTime() - now.getTime();
            const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

            if (daysLeft === 3 || daysLeft === 1) {
                const result = await sendEmail(
                    user.email,
                    emailTemplates.membershipExpiryReminder(user, daysLeft)
                );
                reminders.push({ member: user.fullName, email: user.email, daysLeft, ...result });
            }
        }

        res.json({
            message: `Checked ${members.length} members. Sent ${reminders.filter(r => r.sent).length} reminder(s).`,
            reminders
        });
    } catch (err) {
        console.error('Membership reminder cron error:', err);
        res.status(500).json({ error: err.message });
    }
});

const Event = require('../models/Event');

/**
 * GET /api/cron/event-reminder
 * Call this endpoint daily. It scans all events and sends a reminder 3 days before and day-of.
 */
router.get('/event-reminder', async (req, res) => {
    try {
        const now = new Date();
        const members = await User.find({ role: 'member', email: { $exists: true, $ne: null } });
        const events = await Event.find();

        const reminders = [];
        const todayStr = now.toISOString().split('T')[0];
        const threeDaysMs = now.getTime() + 3 * 24 * 60 * 60 * 1000;
        const threeDaysFromNow = new Date(threeDaysMs).toISOString().split('T')[0];

        for (const event of events) {
            let daysLeft = -1;
            if (event.date === todayStr) daysLeft = 0;
            else if (event.date === threeDaysFromNow) daysLeft = 3;

            if (daysLeft === 0 || daysLeft === 3) {
                for (const user of members) {
                    const result = await sendEmail(user.email, emailTemplates.eventReminder(event, user, daysLeft));
                    reminders.push({ event: event.title, user: user.fullName, daysLeft, sent: result.sent });
                }
            }
        }
        res.json({ message: "Event reminders processed", reminders });
    } catch (err) {
        console.error('Event reminder cron error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
