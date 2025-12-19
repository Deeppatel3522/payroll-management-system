const mongoose = require('mongoose');
const SalarySlipSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'Generated' }
});
module.exports = mongoose.model('SalarySlip', SalarySlipSchema);