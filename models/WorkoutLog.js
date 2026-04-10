const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    programName: { type: String, required: true },
    week: { type: Number },
    day: { type: String },
    exercisesCompleted: { type: [String] },
    completionPercentage: { type: Number },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);
