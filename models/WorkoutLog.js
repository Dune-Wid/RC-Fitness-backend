const mongoose = require('mongoose');

const WorkoutLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, // optional for now since auth might not be fully linked in frontend state
    programName: { type: String, required: true },
    week: { type: Number },
    day: { type: String },
    exercisesCompleted: [{ type: String }],
    completionPercentage: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('WorkoutLog', WorkoutLogSchema);
