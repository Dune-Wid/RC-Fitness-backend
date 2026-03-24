const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Import Routes
const authRoute = require('./routes/auth');
const financeRoute = require('./routes/finance');
const shopRoute = require('./routes/shop');
const eventRoute = require('./routes/events');

// Initialize Environment Variables
dotenv.config();

// --- 1. MIDDLEWARE ---
// CORS allows your frontend to communicate with this backend securely
app.use(cors({ 
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token']
}));

// Parses incoming JSON data from the frontend
app.use(express.json());

// --- 2. SERVERLESS DATABASE CONNECTION MANAGER ---
// This prevents the "buffering timed out after 10000ms" error on Vercel
const connectDB = async () => {
    // If Mongoose is already connected (readyState 1), reuse the connection
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    
    // Otherwise, establish a fresh connection
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err);
    }
};

// CRITICAL: Force Vercel to check the DB connection BEFORE processing any request
app.use(async (req, res, next) => {
    await connectDB();
    next();
});

// --- 3. ROUTES ---
// Mount the authentication and user management routes
app.use('/api/user', authRoute);
// Mount the new feature routes
app.use('/api/finance', financeRoute);
app.use('/api/shop', shopRoute);
app.use('/api/events', eventRoute);

// Base Route (Health Check)
app.get('/', (req, res) => {
    res.send('RC Fitness API is running smoothly on Vercel with Serverless DB Management!');
});

// --- 4. SERVER INITIALIZATION & VERCEL EXPORT ---
if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

// This starts the server when you are testing locally on your computer
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

// CRITICAL: This line exports the Express app so Vercel can run it as a Serverless Function
module.exports = app;
