const mongoose = require('mongoose');

const JobRoleSchema = new mongoose.Schema({
    roleName: { type: String, required: true, unique: true },
    baseSalary: { type: Number, required: true, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('JobRole', JobRoleSchema);
