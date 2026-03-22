require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User'); // Import the model we created in Step 2

const seedAdmin = async () => {
    try {
        // 1. Connect to your Cloud DB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB for seeding...");

        // 2. Check if an admin already exists to avoid duplicates
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            console.log("Admin user already exists! No need to seed.");
            process.exit();
        }

        // 3. Hash the credentials for security
        // Using common defaults for your testing
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        const hashedPin = await bcrypt.hash('1234', salt);

        // 4. Create the Admin object
        const adminUser = new User({
            fullName: "System Administrator",
            email: "admin@gmail.com",
            password: hashedPassword,
            nic: "000000000V", // Placeholder NIC
            role: "admin",
            backupPin: hashedPin,
            physicalStats: {
                weight: 75,
                height: 175,
                bmi: 24.5
            }
        });

        // 5. Save to MongoDB
        await adminUser.save();
        console.log("Admin account created successfully!");
        console.log("Email: admin@gmail.com | Password: admin123");
        
        process.exit();
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
};

seedAdmin();