const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point',
  },
  coordinates: {
    type: [Number],
    required: true,
  },
});

const ShiftSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'on_break', 'completed'],
      default: 'active',
    },
    breaks: [
      {
        type: {
          type: String,
          enum: ['lunch', 'short'],
          required: true,
        },
        startTime: {
          type: Date,
          required: true,
        },
        endTime: {
          type: Date,
          default: null,
        },
        location: {
          type: PointSchema,
          required: true,
        },
      },
    ],
    startLocation: {
      type: PointSchema,
      required: true,
    },
    endLocation: {
      type: PointSchema,
      default: null,
    },
    totalWorkDuration: {
      type: Number, // in minutes
      default: 0,
    },
    totalBreakDuration: {
      type: Number, // in minutes
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total work duration when shift is ended
ShiftSchema.pre('save', function (next) {
  if (this.endTime && this.status === 'completed') {
    let totalBreakMinutes = 0;
    
    // Calculate total break duration
    if (this.breaks && this.breaks.length > 0) {
      this.breaks.forEach((breakItem) => {
        if (breakItem.endTime) {
          const breakDuration = (breakItem.endTime - breakItem.startTime) / (1000 * 60);
          totalBreakMinutes += breakDuration;
        }
      });
    }
    
    this.totalBreakDuration = totalBreakMinutes;
    
    // Calculate total work duration excluding breaks
    const totalShiftMinutes = (this.endTime - this.startTime) / (1000 * 60);
    this.totalWorkDuration = totalShiftMinutes - totalBreakMinutes;
  }
  next();
});

module.exports = mongoose.model('Shift', ShiftSchema);
