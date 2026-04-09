const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
    try {
        const directUri = "mongodb://admin:adminpass@ac-2sq6usm-shard-00-01.jpt5ufv.mongodb.net:27017/?authSource=admin&directConnection=true&ssl=true";
        console.log('Attempting direct connection to one shard...');
        await mongoose.connect(directUri, {
            serverSelectionTimeoutMS: 5000,
        });
        console.log('✅ Connected to MongoDB Atlas (Single Shard)');
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));
        
        for (const col of collections) {
            const count = await db.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count} docs`);
        }
        
        process.exit(0);
    } catch (err) {
        console.error('❌ Error details:');
        console.error('Message:', err.message);
        console.error('Code:', err.code);
        process.exit(1);
    }
};

checkDB();
