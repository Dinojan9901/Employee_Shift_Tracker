const express = require('express');
const {
  startShift,
  endShift,
  startBreak,
  endBreak,
  getCurrentShift,
  getShifts,
  getAllShifts,
} = require('../controllers/shifts-updated');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(protect);

router.post('/start', startShift);
router.put('/end', endShift);
router.put('/break/start', startBreak);
router.put('/break/end', endBreak);
router.get('/current', getCurrentShift);
router.get('/', getShifts);
router.get('/all', authorize('admin'), getAllShifts);

module.exports = router;
