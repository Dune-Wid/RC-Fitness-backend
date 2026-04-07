const mongoose = require('mongoose');

<<<<<<< Updated upstream
const EquipmentSchema = new mongoose.Schema({
<<<<<<< Updated upstream
    equipmentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    area: { type: String, required: true },
    status: { type: String, enum: ['WORKING', 'UNDER MAINTAINING'], default: 'WORKING' },
    lastServiceDate: { type: Date, required: true },
    nextServiceDate: { type: Date, required: true }
}, { timestamps: true });

// Pre-save middleware to automatically calculate nextServiceDate if lastServiceDate is provided/updated
EquipmentSchema.pre('save', function(next) {
    if (this.isModified('lastServiceDate')) {
        const nextDate = new Date(this.lastServiceDate);
        nextDate.setMonth(nextDate.getMonth() + 4);
        this.nextServiceDate = nextDate;
    }
    next();
});

=======
    id_tag: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    status: { type: String, enum: ['WORKING', 'UNDER MAINTAINING'], default: 'WORKING' },
    daysUntilService: { type: Number, required: true }
}, { timestamps: true });

>>>>>>> Stashed changes
module.exports = mongoose.model('Equipment', EquipmentSchema);
=======
const equipmentSchema = new mongoose.Schema({
  id_tag: { type: String, default: "EQ-XXX" },
  name: { type: String, required: true },
  location: { type: String },
  status: { type: String, default: 'WORKING' },
  daysUntilService: { type: Number, default: 30 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', equipmentSchema);
>>>>>>> Stashed changes
