const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const entriesRoutes = require('./routes/entries');
const dashboardRoutes = require('./routes/dashboard');
const scorecardsRoutes = require('./routes/scorecards');
const positionsRoutes = require('./routes/positions');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/scorecards', scorecardsRoutes);
app.use('/api/positions', positionsRoutes);

module.exports = app;
