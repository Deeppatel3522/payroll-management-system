// backend/seed-safe.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const demoUsers = [
    { email: 'admin@anshumat.org', password: 'password123', role: 'admin' },
    { email: 'jane.manager@anshumat.org', password: 'password123', role: 'admin' },
    { email: 'john.doe@anshumat.org', password: 'password123', role: 'employee' },
    { email: 'alice.smith@anshumat.org', password: 'password123', role: 'employee' },
    { email: 'bob.wilson@anshumat.org', password: 'password123', role: 'employee' }
];

const seedSafe = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("📡 Connected to MongoDB...");

        const salt = await bcrypt.genSalt(10);
        let addedCount = 0;
        let skippedCount = 0;

        for (const u of demoUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: u.email });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash(u.password, salt);
                await User.create({
                    ...u,
                    password: hashedPassword
                });
                console.log(`✅ Created: ${u.email}`);
                addedCount++;
            } else {
                console.log(`⏭️  Skipped (Already exists): ${u.email}`);
                skippedCount++;
            }
        }

        console.log("-------------------------------");
        console.log(`Done! Added: ${addedCount}, Skipped: ${skippedCount}`);
        console.log("Your previous users are still safe.");
        process.exit();
    } catch (err) {
        console.error("❌ Seeding Error:", err);
        process.exit(1);
    }
};

seedSafe();