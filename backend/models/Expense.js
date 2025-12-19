const mongoose = require('mongoose');
const ExpenseSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'pending' }
});
module.exports = mongoose.model('Expense', ExpenseSchema);