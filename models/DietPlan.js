const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    goal: { type: String, default: 'Weight Loss' },
    targetCalories: { type: Number, default: 2000 },
    coachNote: { type: String },
    meals: [{
        time: String,
        name: String,
        items: [String],
        cals: Number,
        macros: {
            p: Number,
            c: Number,
            f: Number
        },
        macroPercents: {
            p: String,
            c: String,
            f: String
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('DietPlan', DietPlanSchema);
