const mongoose = require('mongoose');

const PayrollSchema = new mongoose.Schema({
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    staffName: { type: String, required: true },
    month: { type: String, required: true }, // e.g., "April"
    year: { type: Number, required: true }, // e.g., 2026
    amount: { type: Number, required: true },
    status: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    datePaid: { type: String }, // ISO Date string
}, { timestamps: true });

module.exports = mongoose.model('Payroll', PayrollSchema);
