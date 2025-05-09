const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const auth = require('./routes/auth');
const shifts = require('./routes/shifts');
const email = require('./routes/email');

const app = express();

// Body parser
app.use(express.json());

// Enable CORS with specific options for production and development
app.use(cors({
  origin: [
    // Render deployed frontend
    'https://employeeshift.onrender.com',
    // Local development
    'http://localhost:3000',
    // Self-reference for API-to-API calls
    'https://employee-shift-tracker.onrender.com'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Mount routers
app.use('/api/auth', auth);
app.use('/api/shifts', shifts);
app.use('/api/email', email);

// Basic route
app.get('/', (req, res) => {
  res.send('Employee Shift Tracker API is running...');
});

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
