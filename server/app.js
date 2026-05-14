const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/habits', require('./routes/habitRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/simulation', require('./routes/simulationRoutes'));
app.use('/api/files', require('./routes/fileRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Health check route
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DesignMyLife API is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = app;
