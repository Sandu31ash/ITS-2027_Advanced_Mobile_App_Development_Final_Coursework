const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const dotenv = require('dotenv');
const auth = require('./controller/auth');
const note = require('./controller/note');
const taskList = require('./controller/taskList');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();


app.use(express.json());
// Middleware
app.use(cors({
    origin: 'http://localhost:8081', // no trailing slash
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'], // Explicitly specify headers
    credentials: true,
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB:', error));

app.listen(5000, () => {
    console.log('Listening on port 5000');

});


app.use('/api/v1/auth',auth)
app.use('/api/v1/note',note)
app.use('/api/v1/task',taskList)
