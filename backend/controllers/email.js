const User = require('../models/User');
const Shift = require('../models/Shift');
const { sendShiftCompletionEmail } = require('../utils/emailService');

// @desc    Send shift completion email
// @route   POST /api/email/shift-complete
// @access  Private
exports.sendShiftCompletionNotification = async (req, res) => {
  try {
    const { shiftId } = req.body;

    if (!shiftId) {
      return res.status(400).json({
        success: false,
        error: 'Please provide shift ID',
      });
    }

    // Get shift data
    const shift = await Shift.findById(shiftId).populate('employee');

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'Shift not found',
      });
    }

    // Check if the user is authorized to send this email
    if (req.user.role !== 'admin' && shift.employee._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send this notification',
      });
    }

    // Send email
    const emailResult = await sendShiftCompletionEmail(shift.employee, shift);
    
    if (!emailResult) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send email notification',
      });
    }

    // For development environment, return preview URL
    let responseData = { success: true, message: 'Email notification sent successfully' };
    
    if (process.env.NODE_ENV === 'development' && emailResult.messageId) {
      responseData.previewUrl = emailResult.previewUrl;
    }

    res.status(200).json(responseData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Helper function to send shift completion email
// This can be called from other controllers
exports.sendShiftCompleteEmail = async (userId, shiftId) => {
  try {
    const user = await User.findById(userId);
    const shift = await Shift.findById(shiftId);

    if (!user || !shift) {
      return null;
    }

    const emailResult = await sendShiftCompletionEmail(user, shift);
    return emailResult;
  } catch (error) {
    console.error(`Error sending shift completion email: ${error.message}`);
    return null;
  }
};
