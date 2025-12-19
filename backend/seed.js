const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    const hashedPassword = await bcrypt.hash("HireMe@2025!", 10);
    await User.create({ email: "hire-me@anshumat.org", password: hashedPassword, role: "admin" });
    console.log("✅ Demo user seeded!");
    process.exit();
};
seed();