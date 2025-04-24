// backend/server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const searchRoutes = require('./routes/searchRoutes');

// Initialize Express app
const app = express();
const PORT = 3000;

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Enable CORS for development
app.use(cors({
    origin: ['http://localhost:63342', 'http://127.0.0.1:63342', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/search', searchRoutes);

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Handle SPA routing - For any route not matched by the server, serve the index page
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Test database connection before starting server
const startServer = async () => {
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
        console.error('Could not connect to database. Server will not start.');
        process.exit(1);
    }

    // Start server
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to access the application`);
        console.log(`API available at http://localhost:${PORT}/api/search`);
    });
};

startServer();

// Handle unhandled errors
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});