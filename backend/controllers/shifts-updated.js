const Shift = require('../models/Shift');
const User = require('../models/User');
const { triggerShiftCompletionEmail } = require('../utils/emailTriggers');

// @desc    Start a new shift
// @route   POST /api/shifts/start
// @access  Private
exports.startShift = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide location coordinates',
      });
    }

    // Check if user already has an active shift
    const activeShift = await Shift.findOne({
      employee: req.user.id,
      status: { $in: ['active', 'on_break'] },
    });

    if (activeShift) {
      return res.status(400).json({
        success: false,
        error: 'You already have an active shift',
      });
    }

    // Create new shift
    const shift = await Shift.create({
      employee: req.user.id,
      startTime: new Date(),
      startLocation: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    res.status(201).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    End current shift
// @route   PUT /api/shifts/end
// @access  Private
exports.endShift = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide location coordinates',
      });
    }

    // Find active shift
    let shift = await Shift.findOne({
      employee: req.user.id,
      status: { $in: ['active', 'on_break'] },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'No active shift found',
      });
    }

    // If on break, end the break first
    if (shift.status === 'on_break' && shift.breaks.length > 0) {
      const currentBreak = shift.breaks[shift.breaks.length - 1];
      if (!currentBreak.endTime) {
        currentBreak.endTime = new Date();
      }
    }

    // Update shift
    shift.endTime = new Date();
    shift.status = 'completed';
    shift.endLocation = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    await shift.save();
    
    // Send email notification for shift completion
    try {
      await triggerShiftCompletionEmail(req.user.id, shift);
    } catch (emailError) {
      console.error('Error triggering shift completion email:', emailError);
      // We continue the process even if email fails
    }

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Start a break
// @route   PUT /api/shifts/break/start
// @access  Private
exports.startBreak = async (req, res) => {
  try {
    const { breakType, latitude, longitude } = req.body;

    if (!breakType || !latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide break type and location coordinates',
      });
    }

    // Find active shift
    let shift = await Shift.findOne({
      employee: req.user.id,
      status: 'active',
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'No active shift found',
      });
    }

    // Add break
    shift.breaks.push({
      type: breakType,
      startTime: new Date(),
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    shift.status = 'on_break';
    await shift.save();

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    End a break
// @route   PUT /api/shifts/break/end
// @access  Private
exports.endBreak = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        error: 'Please provide location coordinates',
      });
    }

    // Find shift on break
    let shift = await Shift.findOne({
      employee: req.user.id,
      status: 'on_break',
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'No shift on break found',
      });
    }

    // Update the latest break
    if (shift.breaks.length > 0) {
      const currentBreak = shift.breaks[shift.breaks.length - 1];
      currentBreak.endTime = new Date();
      
      // Update end location
      currentBreak.location.coordinates = [longitude, latitude];
    }

    shift.status = 'active';
    await shift.save();

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get current shift
// @route   GET /api/shifts/current
// @access  Private
exports.getCurrentShift = async (req, res) => {
  try {
    const shift = await Shift.findOne({
      employee: req.user.id,
      status: { $in: ['active', 'on_break'] },
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        error: 'No active shift found',
      });
    }

    res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all shifts for current user
// @route   GET /api/shifts
// @access  Private
exports.getShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({ employee: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// @desc    Get all shifts (admin only)
// @route   GET /api/shifts/all
// @access  Private/Admin
exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.find().populate({
      path: 'employee',
      select: 'name email',
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
