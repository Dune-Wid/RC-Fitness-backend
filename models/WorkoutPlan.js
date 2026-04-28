const mongoose = require('mongoose');

const workoutPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    programName: { type: String, required: true },
    week: { type: Number, required: true },
    focus: { type: String, required: true },
    days: [{
        dayName: { type: String, required: true },
        exercises: [{
            id: String,
            name: String,
            sets: Number,
            reps: String,
            rest: String
        }]
    }],
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);
