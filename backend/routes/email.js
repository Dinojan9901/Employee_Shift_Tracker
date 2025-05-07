const express = require('express');
const { sendShiftCompletionNotification } = require('../controllers/email');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

// Route to send shift completion email
router.post('/shift-complete', sendShiftCompletionNotification);

module.exports = router;
