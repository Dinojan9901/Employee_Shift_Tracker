import React, { useMemo } from 'react';
import { 
  Paper, 
  Typography, 
  Box, 
  Divider,
  CircularProgress
} from '@mui/material';
import { 
  AccessTime, 
  DateRange,
  TrendingUp
} from '@mui/icons-material';

const ShiftStats = ({ history = [] }) => {
  // Calculate statistics from shift history
  const stats = useMemo(() => {
    if (!history || history.length === 0) {
      return {
        totalHours: 0,
        shiftsCompleted: 0,
        avgHoursPerShift: 0,
        currentWeekHours: 0
      };
    }

    // Filter completed shifts
    const completedShifts = history.filter(shift => shift.status === 'completed');
    
    // Calculate total work hours from all completed shifts
    const totalMinutes = completedShifts.reduce(
      (total, shift) => total + (shift.totalWorkDuration || 0), 
      0
    );
    
    // Calculate average hours per shift
    const avgMinutes = completedShifts.length > 0 
      ? totalMinutes / completedShifts.length 
      : 0;
    
    // Get current week shifts
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const currentWeekShifts = completedShifts.filter(
      shift => new Date(shift.endTime) >= startOfWeek
    );
    
    const currentWeekMinutes = currentWeekShifts.reduce(
      (total, shift) => total + (shift.totalWorkDuration || 0),
      0
    );
    
    return {
      totalHours: (totalMinutes / 60).toFixed(1),
      shiftsCompleted: completedShifts.length,
      avgHoursPerShift: (avgMinutes / 60).toFixed(1),
      currentWeekHours: (currentWeekMinutes / 60).toFixed(1)
    };
  }, [history]);

  if (!history) {
    return (
      <Paper
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 240
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 240
      }}
    >
      <Typography variant="h6" gutterBottom>
        Work Statistics
      </Typography>
      
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <DateRange sx={{ mr: 1.5, color: 'primary.main' }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Shifts Completed
          </Typography>
          <Typography variant="h5">
            {stats.shiftsCompleted}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <AccessTime sx={{ mr: 1.5, color: 'success.main' }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Total Hours Worked
          </Typography>
          <Typography variant="h5">
            {stats.totalHours}h
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ my: 2, display: 'flex', alignItems: 'center' }}>
        <TrendingUp sx={{ mr: 1.5, color: 'info.main' }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Current Week Hours
          </Typography>
          <Typography variant="h5">
            {stats.currentWeekHours}h
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        <AccessTime sx={{ mr: 1.5, color: 'warning.main' }} />
        <Box>
          <Typography variant="body2" color="textSecondary">
            Avg Hours Per Shift
          </Typography>
          <Typography variant="h5">
            {stats.avgHoursPerShift}h
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default ShiftStats;
