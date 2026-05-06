require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Initialize Express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors()); // Allows your React frontend to communicate with the API
app.use(express.json()); // Parses incoming JSON requests

// Basic Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'BuildForge API is running optimally.' });
});

// --- Feature Routes Will Go Here ---
app.use('/api/auth', require('./features/auth/authRoutes'));
app.use('/api/builds', require('./features/builds/buildRoutes'));
app.use('/api/advisor', require('./features/advisor/advisorRoutes'));

// Global Error Handler (Fallback)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});