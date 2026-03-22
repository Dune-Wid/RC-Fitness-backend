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
// CORS allows your frontend (hosted elsewhere) to communicate with this backend
app.use(cors({ 
    origin: '*', // Allows requests from any origin (Crucial for Vercel)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'auth-token']
}));

// Parses incoming JSON data from the frontend
app.use(express.json());


// --- 2. DATABASE CONNECTION ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));


// --- 3. ROUTES ---
// Mount the authentication and user management routes
app.use('/api/user', authRoute);
// Mount the new feature routes
app.use('/api/finance', financeRoute);
app.use('/api/shop', shopRoute);
app.use('/api/events', eventRoute);

// Base Route (Health Check) - Useful to test if Vercel deployment is live
app.get('/', (req, res) => {
    res.send('RC Fitness API is successfully running on Vercel!');
});


// --- 4. SERVER INITIALIZATION & VERCEL EXPORT ---
const PORT = process.env.PORT || 5000;

// This starts the server when you are testing locally on your computer
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`🚀 Server is running locally on port ${PORT}`);
    });
}

// CRITICAL: This line exports the Express app so Vercel can run it as a Serverless Function
module.exports = app;