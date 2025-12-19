const router = require('express').Router();
const SalarySlip = require('../models/SalarySlip');
const Expense = require('../models/Expense');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Admin: Create Salary Slip [cite: 14]
router.post('/salary-slip', verifyToken, isAdmin, async (req, res) => {
    const slip = new SalarySlip(req.body);
    await slip.save();
    res.status(201).json(slip);
});

// Employee: Submit Expense [cite: 18]
router.post('/expense', verifyToken, async (req, res) => {
    const expense = new Expense({ ...req.body, employeeId: req.user.id });
    await expense.save();
    res.status(201).json(expense);
});

// GET expenses: Admin sees all, Employee sees only their own
router.get('/expense', verifyToken, async (req, res) => {
    try {
        let expenses;
        if (req.user.role === 'admin') {
            // Admin sees everything with employee emails
            expenses = await Expense.find().populate('employeeId', 'email');
        } else {
            // Employee sees only their own list
            expenses = await Expense.find({ employeeId: req.user.id });
        }
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: "Error fetching expenses: " + err.message });
    }
});

// Admin: Update Expense Status (Approve/Decline)
router.patch('/expense/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;

        // Validate status to prevent random strings in your database
        const validStatuses = ['pending', 'approved', 'declined'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" });
        }

        const updatedExpense = await Expense.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        ).populate('employeeId', 'email');

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(updatedExpense);
    } catch (err) {
        res.status(500).json({ message: "Error updating status: " + err.message });
    }
});

// PUT route for updating slips 
router.put('/salary-slip/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const updatedSlip = await SalarySlip.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true } // This returns the modified document rather than the original
        );
        if (!updatedSlip) return res.status(404).json({ message: "Slip not found" });
        res.json(updatedSlip);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// GET salary-slips: Admin sees all, Employee sees only their own
router.get('/salary-slip', verifyToken, async (req, res) => {
    try {
        let slips;
        if (req.user.role === 'admin') {
            slips = await SalarySlip.find().populate('employeeId', 'email');
        } else {
            slips = await SalarySlip.find({ employeeId: req.user.id });
        }
        res.json(slips);
    } catch (err) {
        res.status(500).json({ message: "Error fetching slips: " + err.message });
    }
});
module.exports = router;