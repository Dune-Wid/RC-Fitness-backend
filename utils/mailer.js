const nodemailer = require('nodemailer');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'groupmail404@gmail.com',
        pass: process.env.EMAIL_PASS || 'uoxscxmaetwbycts'
    }
});

const styles = {
    wrapper: `background-color: #080808; color: #fff; padding: 40px; font-family: 'Arial', sans-serif; max-width: 560px; margin: auto; border-radius: 16px;`,
    header: `background: #dc2626; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;`,
    body: `background: #111; padding: 28px; border-radius: 0 0 12px 12px; border: 1px solid #222;`,
    badge: (color) => `display: inline-block; background: ${color}22; color: ${color}; border: 1px solid ${color}44; padding: 4px 14px; border-radius: 99px; font-size: 11px; font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase;`,
    divider: `border: 0; border-top: 1px solid #222; margin: 20px 0;`,
    row: `display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1a1a1a; font-size: 14px;`,
    label: `color: #888; font-weight: 700; text-transform: uppercase; font-size: 11px;`,
    value: `color: #fff; font-weight: 900;`,
    cta: `display: block; background: #dc2626; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 900; text-align: center; letter-spacing: 0.15em; text-transform: uppercase; font-size: 12px; margin-top: 24px;`
};

const emailTemplates = {
    paymentAdded: (payment) => ({
        subject: `✅ Payment Confirmed – RC Fitness`,
        html: `
            <div style="${styles.wrapper}">
                <div style="${styles.header}">
                    <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;">RC FITNESS</h1>
                    <p style="margin:6px 0 0;font-size:12px;opacity:0.7;letter-spacing:0.15em;text-transform:uppercase;">Payment Receipt</p>
                </div>
                <div style="${styles.body}">
                    <p style="margin-bottom:16px;font-size:14px;color:#aaa;">Hello <strong style="color:#fff">${payment.member}</strong>, your payment has been received. Here are the details:</p>
                    <div>
                        <div style="${styles.row}"><span style="${styles.label}">Plan</span><span style="${styles.value}">${payment.duration || 'N/A'}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Date</span><span style="${styles.value}">${payment.date}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Status</span><span style="${styles.badge('#22c55e')}">${payment.status}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Amount</span><span style="${styles.value}" style="color:#22c55e;">LKR ${Number(payment.amount).toLocaleString()}</span></div>
                    </div>
                    <hr style="${styles.divider}"/>
                    <p style="text-align:center;color:#555;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Thank you for your payment. Keep pushing 💪</p>
                </div>
            </div>`
    }),

    paymentUpdated: (payment) => ({
        subject: `🔄 Payment Record Updated – RC Fitness`,
        html: `
            <div style="${styles.wrapper}">
                <div style="${styles.header}">
                    <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;">RC FITNESS</h1>
                    <p style="margin:6px 0 0;font-size:12px;opacity:0.7;letter-spacing:0.15em;text-transform:uppercase;">Payment Updated</p>
                </div>
                <div style="${styles.body}">
                    <p style="margin-bottom:16px;font-size:14px;color:#aaa;">Hello <strong style="color:#fff">${payment.member}</strong>, your payment record has been updated by our staff. Here are the new details:</p>
                    <div>
                        <div style="${styles.row}"><span style="${styles.label}">Plan</span><span style="${styles.value}">${payment.duration || 'N/A'}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Date</span><span style="${styles.value}">${payment.date}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Status</span><span style="${styles.badge('#3b82f6')}">${payment.status}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">New Amount</span><span style="${styles.value}">LKR ${Number(payment.amount).toLocaleString()}</span></div>
                    </div>
                    <hr style="${styles.divider}"/>
                    <p style="text-align:center;color:#555;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">If you did not expect this update, please contact our desk.</p>
                </div>
            </div>`
    }),

    membershipExpiryReminder: (user, daysLeft) => ({
        subject: `⚠️ Your RC Fitness Membership Expires ${daysLeft === 1 ? 'Tomorrow!' : 'in 3 Days'}`,
        html: `
            <div style="${styles.wrapper}">
                <div style="background: ${daysLeft === 1 ? '#7f1d1d' : '#78350f'}; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;">RC FITNESS</h1>
                    <p style="margin:6px 0 0;font-size:12px;opacity:0.7;letter-spacing:0.15em;text-transform:uppercase;">Membership Expiry Alert</p>
                </div>
                <div style="${styles.body}">
                    <p style="font-size:14px;color:#aaa;">Hello <strong style="color:#fff">${user.fullName}</strong>,</p>
                    <p style="font-size:14px;color:#aaa;margin-bottom:20px;">
                        ${daysLeft === 1
                            ? '⚡ <strong style="color:#ef4444">Your membership expires TOMORROW.</strong> Renew today to keep your access uninterrupted!'
                            : '⏰ Your membership will expire in <strong style="color:#f59e0b">3 days</strong>. Don\'t let your progress stop — renew now!'
                        }
                    </p>
                    <div>
                        <div style="${styles.row}"><span style="${styles.label}">Member</span><span style="${styles.value}">${user.fullName}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Plan</span><span style="${styles.value}">${user.membershipType}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Expiry Date</span><span style="${styles.value}">${new Date(user.membershipExpiry).toLocaleDateString()}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Days Remaining</span><span style="${styles.badge(daysLeft === 1 ? '#ef4444' : '#f59e0b')}">${daysLeft} day${daysLeft === 1 ? '' : 's'}</span></div>
                    </div>
                    <a href="https://localhost:5173/membership" style="${styles.cta}">Renew My Membership →</a>
                    <p style="text-align:center;color:#555;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;margin-top:16px;">Visit our front desk or log in to renew your plan.</p>
                </div>
            </div>`
    }),
    
    shopOrderPlaced: (order) => ({
        subject: `🛒 Order Confirmed - RC Store #${order._id.toString().slice(-6).toUpperCase()}`,
        html: `
            <div style="${styles.wrapper}">
                <div style="${styles.header}">
                    <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;">RC FITNESS</h1>
                    <p style="margin:6px 0 0;font-size:12px;opacity:0.7;letter-spacing:0.15em;text-transform:uppercase;">Order Confirmation</p>
                </div>
                <div style="${styles.body}">
                    <p style="margin-bottom:16px;font-size:14px;color:#aaa;">Hello <strong style="color:#fff">${order.userName}</strong>, thank you for your order! We've received it and are processing it now.</p>
                    <div style="background:#000; border:1px solid #222; border-radius:8px; padding:15px; margin-bottom:20px;">
                        <p style="${styles.label}">Items</p>
                        ${order.products.map(p => `
                            <div style="${styles.row}">
                                <span style="color:#fff;">${p.name} <span style="color:#666;font-size:12px">x${p.quantity}</span></span>
                                <span style="color:#fff;font-weight:700;">LKR ${Number(p.price * p.quantity).toLocaleString()}</span>
                            </div>
                        `).join('')}
                    </div>
                    <div>
                        <div style="${styles.row}"><span style="${styles.label}">Subtotal</span><span style="${styles.value}">LKR ${Number(order.totalAmount + (order.discountAmount || 0)).toLocaleString()}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Discount</span><span style="${styles.value}" style="color:#ef4444;">- LKR ${Number(order.discountAmount || 0).toLocaleString()}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Total Paid</span><span style="${styles.value}" style="color:#dc2626; font-size:18px;">LKR ${Number(order.totalAmount).toLocaleString()}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Payment</span><span style="${styles.value}">${order.paymentMethod}</span></div>
                    </div>
                    <hr style="${styles.divider}"/>
                    <p style="text-align:center;color:#555;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">You will receive another update when your order status changes.</p>
                </div>
            </div>`
    }),

    shopOrderStatusChanged: (order) => ({
        subject: `📦 Order Update: ${order.status} - RC Store`,
        html: `
            <div style="${styles.wrapper}">
                <div style="${styles.header}">
                    <h1 style="margin:0;font-size:26px;font-weight:900;letter-spacing:-1px;">RC FITNESS</h1>
                    <p style="margin:6px 0 0;font-size:12px;opacity:0.7;letter-spacing:0.15em;text-transform:uppercase;">Order Status Update</p>
                </div>
                <div style="${styles.body}">
                    <p style="margin-bottom:16px;font-size:14px;color:#aaa;">Hello <strong style="color:#fff">${order.userName}</strong>, the status of your order <strong>#${order._id.toString().slice(-6).toUpperCase()}</strong> has been updated:</p>
                    <div style="text-align:center; padding:20px 0;">
                        <span style="${styles.badge(order.status === 'Completed' || order.status === 'Paid' ? '#22c55e' : order.status === 'Cancelled' ? '#ef4444' : '#3b82f6')}">${order.status}</span>
                    </div>
                    <div>
                        <div style="${styles.row}"><span style="${styles.label}">Order ID</span><span style="${styles.value}">#${order._id}</span></div>
                        <div style="${styles.row}"><span style="${styles.label}">Total Amount</span><span style="${styles.value}">LKR ${Number(order.totalAmount).toLocaleString()}</span></div>
                    </div>
                    <hr style="${styles.divider}"/>
                    <p style="text-align:center;color:#555;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">Visit the shop or contact us if you have any questions.</p>
                </div>
            </div>`
    })
};

const sendEmail = async (to, template) => {
    if (!to) return { sent: false, error: 'No recipient email.' };
    try {
        const transporter = createTransporter();
        await transporter.sendMail({ from: '"RC Fitness" <groupmail404@gmail.com>', to, ...template });
        return { sent: true };
    } catch (err) {
        console.error(`Email send error to ${to}:`, err.message);
        return { sent: false, error: err.message };
    }
};

module.exports = { sendEmail, emailTemplates };
