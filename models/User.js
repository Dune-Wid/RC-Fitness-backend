const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    nic: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'staff', 'member'], default: 'member' },
    status: { type: String, default: 'Active' },

    // Security & Hardware Access (Crucial for both Staff & Members)
    backupPin: { type: String, required: true }, // 4-digit override
    fingerprintId: { type: String, unique: true, sparse: true },

    // Member Specifics
    physicalStats: {
        weight: Number,
        height: Number,
        bmi: Number,
        chest: Number,
        bicep: Number
    },
    membershipType: { type: String },
    treadmillAccess: { type: Boolean, default: false },

    // Staff Specifics
    shift: { type: String },
    specialties: { type: [String] },
    salary: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);