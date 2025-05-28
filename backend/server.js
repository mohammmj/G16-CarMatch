// backend/server.js

/**
 * CarMatch Server Application
 *
 * This is the main server file for the CarMatch application.
 * It sets up the Express server, middleware, routes, and database connection.
 *
 * Features:
 * - API endpoints for car search
 * - API endpoints for user authentication
 * - API endpoints for user profile management
 * - Static file serving
 * - CORS support for development
 * - Error handling
 * - Database connection verification
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./config/db');
const searchRoutes = require('./routes/searchRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Initialize Express app
const app = express();
const PORT = 3000;

/**
 * Request logging middleware
 *
 * Logs all incoming requests with timestamp, HTTP method, and URL
 */
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

/**
 * CORS middleware configuration
 *
 * Enables Cross-Origin Resource Sharing for development environments
 */
app.use(cors({
    origin: ['http://localhost:63342', 'http://127.0.0.1:63342', 'http://localhost:5500', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

/**
 * Body parsing middleware
 *
 * Configures Express to parse incoming request bodies:
 * - JSON for API requests
 * - URL-encoded for form submissions
 */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * API Routes
 *
 * Mounts all API route modules at their respective endpoints:
 * - /api/search for car search functionality
 * - /api/auth for user authentication and profile management
 */
app.use('/api/search', searchRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', profileRoutes); // Profile routes are also under /api/auth

/**
 * Static file serving
 *
 * Serves frontend files
 */
app.use(express.static(path.join(__dirname, '../frontend')));

/**
 * SPA fallback route
 *
 * For any route not matched by the server, serves the index.html file
 * This enables client-side routing for the Single Page Application
 */
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

/**
 * Server startup function
 *
 * Tests the database connection before starting the server
 * If database connection fails, the server will not start
 */
const startServer = async () => {
    const dbConnected = await db.testConnection();

    if (!dbConnected) {
        console.error('Could not connect to database. Server will not start.');
        process.exit(1);
    }

    // Start server if database connection successful
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Visit http://localhost:${PORT} to access the application`);
        console.log(`Car Search API available at http://localhost:${PORT}/api/search`);
        console.log(`Authentication API available at http://localhost:${PORT}/api/auth`);
        console.log(`Profile API available at http://localhost:${PORT}/api/auth/profile`);
    });
};

startServer();

/**
 * Global error handlers
 *
 * Catch unhandled exceptions and promise rejections
 * Prevents the server from crashing silently due to uncaught errors
 */
process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});