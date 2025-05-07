const User = require('../models/User');
const { sendShiftCompletionEmail } = require('./emailService');

/**
 * Trigger an email notification when a shift is completed
 * @param {string} userId - User ID of the employee
 * @param {Object} shift - Completed shift data
 * @returns {Promise<boolean>} - Whether the email was sent successfully
 */
const triggerShiftCompletionEmail = async (userId, shift) => {
  try {
    // Get user data
    const user = await User.findById(userId);
    
    if (!user || !user.email) {
      console.log('User not found or has no email');
      return false;
    }
    
    // Send the email
    const result = await sendShiftCompletionEmail(user, shift);
    
    // Log result
    if (result && result.messageId) {
      console.log(`Shift completion email sent to ${user.email}`);
      
      // For development, log preview URL (when using Ethereal)
      if (process.env.NODE_ENV === 'development') {
        const nodemailer = require('nodemailer');
        console.log(`Email preview URL: ${nodemailer.getTestMessageUrl(result)}`);
      }
      
      return true;
    } else {
      console.log('Email sent but no messageId returned');
      return false;
    }
  } catch (error) {
    console.error(`Error sending shift completion email: ${error.message}`);
    return false;
  }
};

module.exports = {
  triggerShiftCompletionEmail
};
