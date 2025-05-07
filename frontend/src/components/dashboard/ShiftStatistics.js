import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Divider,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import { 
  AccessTime, 
  CalendarMonth, 
  MoreVert, 
  TrendingUp, 
  Timeline, 
  LocationOn,
  Speed,
  Star
} from '@mui/icons-material';

// Helper functions for time calculations
const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins} min`;
  } else if (mins === 0) {
    return `${hours} hr`;
  } else {
    return `${hours} hr ${mins} min`;
  }
};

const getShiftDuration = (shift) => {
  if (!shift.startTime) return 0;
  
  const start = new Date(shift.startTime);
  const end = shift.endTime ? new Date(shift.endTime) : new Date();
  
  return Math.round((end - start) / (1000 * 60)); // Minutes
};

const getBreakDuration = (shift) => {
  if (!shift.breaks || shift.breaks.length === 0) return 0;
  
  return shift.breaks.reduce((total, breakItem) => {
    const start = new Date(breakItem.startTime);
    const end = breakItem.endTime ? new Date(breakItem.endTime) : new Date();
    
    return total + Math.round((end - start) / (1000 * 60));
  }, 0);
};

const calculateWorkingTime = (shift) => {
  const totalDuration = getShiftDuration(shift);
  const breakDuration = getBreakDuration(shift);
  
  return totalDuration - breakDuration;
};

// Statistic Card Component
const StatCard = ({ icon, title, value, secondary, color, progress }) => {
  const theme = useTheme();
  const Icon = icon;
  
  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        borderRadius: 2,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 6
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Box 
          sx={{ 
            backgroundColor: `${color}20`, // 20% opacity
            p: 1,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Icon sx={{ color: color, fontSize: 28 }} />
        </Box>
      </Box>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 0.5 }}>
        {value}
      </Typography>
      
      {secondary && (
        <Typography variant="body2" color="textSecondary">
          {secondary}
        </Typography>
      )}
      
      {progress !== undefined && (
        <Box sx={{ mt: 1.5, width: '100%' }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              backgroundColor: theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(0, 0, 0, 0.1)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: color,
                borderRadius: 3
              }
            }} 
          />
        </Box>
      )}
    </Paper>
  );
};

const ShiftStatistics = ({ shifts = [], currentShift = null, period = 'week', onFilterChange }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleFilterChange = (newPeriod) => {
    if (onFilterChange) {
      onFilterChange(newPeriod);
    }
    handleClose();
  };
  
  // Calculate statistics
  const calculateStats = () => {
    if (!shifts || !Array.isArray(shifts)) {
      return {
        totalShifts: 0,
        totalWorkingTime: 0,
        avgShiftDuration: 0,
        totalBreakTime: 0,
        productivePercentage: 0,
        totalBreaks: 0,
        avgBreaksPerShift: 0
      };
    }

    const now = new Date();
    let filteredShifts = [...shifts];
    
    // Filter shifts based on period
    if (period === 'today') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filteredShifts = shifts.filter(shift => shift.startTime && new Date(shift.startTime) >= today);
    } else if (period === 'week') {
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 7);
      filteredShifts = shifts.filter(shift => shift.startTime && new Date(shift.startTime) >= lastWeek);
    } else if (period === 'month') {
      const lastMonth = new Date(now);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      filteredShifts = shifts.filter(shift => shift.startTime && new Date(shift.startTime) >= lastMonth);
    }
    
    // Include current shift if it exists
    if (currentShift) {
      filteredShifts = [currentShift, ...filteredShifts.filter(s => s._id !== currentShift._id)];
    }
    
    const completedShifts = filteredShifts.filter(shift => shift.status === 'completed');
    
    // Total shifts
    const totalShifts = filteredShifts.length;
    
    // Total working time (in minutes)
    const totalWorkingTime = filteredShifts.reduce((total, shift) => {
      return total + calculateWorkingTime(shift);
    }, 0);
    
    // Average shift duration
    const avgShiftDuration = totalShifts > 0 
      ? Math.round(totalWorkingTime / totalShifts) 
      : 0;
    
    // Total break time
    const totalBreakTime = filteredShifts.reduce((total, shift) => {
      return total + getBreakDuration(shift);
    }, 0);
    
    // Productive time percentage
    const productivePercentage = totalWorkingTime + totalBreakTime > 0 
      ? Math.round((totalWorkingTime / (totalWorkingTime + totalBreakTime)) * 100) 
      : 0;
    
    // Number of breaks
    const totalBreaks = filteredShifts.reduce((total, shift) => {
      return total + (shift.breaks ? shift.breaks.length : 0);
    }, 0);
    
    // Average breaks per shift
    const avgBreaksPerShift = totalShifts > 0 
      ? Math.round((totalBreaks / totalShifts) * 10) / 10
      : 0;
    
    return {
      totalShifts,
      totalWorkingTime,
      avgShiftDuration,
      totalBreakTime,
      productivePercentage,
      totalBreaks,
      avgBreaksPerShift
    };
  };
  
  const stats = calculateStats();
  
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Shift Statistics
        </Typography>
        
        <Box>
          <IconButton size="small" onClick={handleClick}>
            <MoreVert />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={() => handleFilterChange('today')}>Today</MenuItem>
            <MenuItem onClick={() => handleFilterChange('week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleFilterChange('month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleFilterChange('all')}>All Time</MenuItem>
          </Menu>
        </Box>
      </Box>
      
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        {period === 'today' && 'Statistics for today'}
        {period === 'week' && 'Statistics for last 7 days'}
        {period === 'month' && 'Statistics for last 30 days'}
        {period === 'all' && 'Statistics for all time'}
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={CalendarMonth}
            title="Total Shifts"
            value={stats.totalShifts}
            secondary={currentShift ? "Including current shift" : null}
            color={theme.palette.primary.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={AccessTime}
            title="Work Time"
            value={formatDuration(stats.totalWorkingTime)}
            secondary="Total productive time"
            color={theme.palette.success.main}
            progress={stats.productivePercentage}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={TrendingUp}
            title="Avg. Duration"
            value={formatDuration(stats.avgShiftDuration)}
            secondary="Per shift"
            color={theme.palette.info.main}
          />
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={Timeline}
            title="Break Time"
            value={formatDuration(stats.totalBreakTime)}
            secondary={`${stats.totalBreaks} breaks (${stats.avgBreaksPerShift}/shift)`}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default ShiftStatistics;
