const mongoose = require('mongoose');

const FingerPrintScanSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    scannedAt: { 
        type: Date, 
        default: Date.now 
    },
    status: {
        type: String,
        default: 'Completed'
    }
}, { timestamps: true });

// Ensure we only keep the latest scan or use it as a log
module.exports = mongoose.model('FingerPrintScan', FingerPrintScanSchema);
