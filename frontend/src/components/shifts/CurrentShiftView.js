import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Chip, 
  Divider, 
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  AccessTime,
  Timer,
  LocationOn,
  Restaurant,
  Coffee,
  LocalDrink,
  Smoke,
  Healing,
  PlayArrow,
  Stop,
  Pause,
  Check
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';

// Timer component that updates every second
const LiveTimer = ({ startTime, breakDuration = 0 }) => {
  const [elapsed, setElapsed] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      if (!startTime) return;
      
      const start = new Date(startTime).getTime();
      const now = new Date().getTime();
      const elapsedMs = now - start - (breakDuration * 60 * 1000);
      
      setElapsed(Math.max(0, elapsedMs));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, breakDuration]);
  
  // Format elapsed time
  const formatElapsedTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  if (!startTime) return <Typography variant="h4">--:--:--</Typography>;
  
  return (
    <Typography variant="h4" fontWeight="bold">
      {formatElapsedTime(elapsed)}
    </Typography>
  );
};

// Custom break button component
const BreakButton = ({ type, label, icon, onClick, disabled, active }) => {
  const theme = useTheme();
  const Icon = icon;
  
  return (
    <Button
      variant={active ? "contained" : "outlined"}
      color={active ? "warning" : "primary"}
      onClick={() => onClick(type)}
      disabled={disabled}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        p: 1.5,
        minWidth: 90,
        borderRadius: 2,
        gap: 1
      }}
    >
      <Icon />
      <Typography variant="caption" sx={{ mt: 0.5 }}>
        {label}
      </Typography>
    </Button>
  );
};

// Current shift status indicator
const ShiftStatusIndicator = ({ status }) => {
  const theme = useTheme();
  
  let color = theme.palette.primary.main;
  let icon = <AccessTime />;
  let text = 'Unknown';
  
  switch (status) {
    case 'active':
      color = theme.palette.success.main;
      icon = <AccessTime />;
      text = 'On Shift';
      break;
    case 'on_break':
      color = theme.palette.warning.main;
      icon = <Pause />;
      text = 'On Break';
      break;
    case 'completed':
      color = theme.palette.info.main;
      icon = <Check />;
      text = 'Completed';
      break;
    default:
      color = theme.palette.grey[500];
      icon = <AccessTime />;
      text = 'Not Started';
  }
  
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        mb: 3
      }}
    >
      <Box 
        sx={{ 
          width: 48, 
          height: 48, 
          borderRadius: '50%', 
          bgcolor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="body2" color="textSecondary">
          Current Status
        </Typography>
        <Typography variant="h6" fontWeight="bold">
          {text}
        </Typography>
      </Box>
    </Box>
  );
};

// Main current shift view component
const CurrentShiftView = ({ 
  currentShift, 
  loading, 
  onStartShift, 
  onEndShift, 
  onStartBreak, 
  onEndBreak, 
  currentLocation 
}) => {
  const theme = useTheme();
  
  // Calculate total break duration in minutes
  const calculateBreakDuration = () => {
    if (!currentShift || !currentShift.breaks || !Array.isArray(currentShift.breaks) || currentShift.breaks.length === 0) {
      return 0;
    }
    
    return currentShift.breaks.reduce((total, breakItem) => {
      if (!breakItem || !breakItem.startTime) return total;
      
      const start = new Date(breakItem.startTime);
      const end = breakItem.endTime ? new Date(breakItem.endTime) : new Date();
      const durationMinutes = Math.floor((end - start) / (1000 * 60));
      
      return total + durationMinutes;
    }, 0);
  };
  
  const breakDuration = calculateBreakDuration();
  
  // Get current active break if any
  const getCurrentBreak = () => {
    if (!currentShift || !currentShift.breaks || currentShift.breaks.length === 0) {
      return null;
    }
    
    const lastBreak = currentShift.breaks[currentShift.breaks.length - 1];
    
    if (currentShift.status === 'on_break' && !lastBreak.endTime) {
      return lastBreak;
    }
    
    return null;
  };
  
  const currentBreak = getCurrentBreak();
  
  // Break types
  const breakTypes = [
    { type: 'lunch', label: 'Lunch', icon: Restaurant },
    { type: 'coffee', label: 'Coffee', icon: Coffee },
    { type: 'drink', label: 'Drink', icon: LocalDrink },
    { type: 'smoke', label: 'Smoke', icon: Smoke },
    { type: 'personal', label: 'Personal', icon: Healing }
  ];
  
  return (
    <Box>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Status indicator */}
          <ShiftStatusIndicator 
            status={currentShift ? currentShift.status : 'not_started'} 
          />
          
          {/* Timer and controls */}
          <Paper 
            elevation={3}
            sx={{ 
              p: 3, 
              borderRadius: 3, 
              mb: 3,
              background: currentShift 
                ? `linear-gradient(to right, ${theme.palette.mode === 'dark' 
                    ? 'rgba(45, 45, 45, 0.9)' 
                    : 'rgba(255, 255, 255, 0.9)'}, ${theme.palette.mode === 'dark' 
                    ? 'rgba(35, 35, 35, 0.9)' 
                    : 'rgba(245, 245, 245, 0.9)'})`
                : theme.palette.background.paper,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background pattern */}
            {currentShift && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '150px',
                  height: '150px',
                  background: 'radial-gradient(circle, rgba(0,0,0,0.03) 0%, rgba(0,0,0,0) 70%)',
                  borderRadius: '50%',
                  transform: 'translate(30%, -30%)',
                }}
              />
            )}
            
            <Box sx={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              {currentShift ? (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Elapsed Time
                    </Typography>
                    <LiveTimer 
                      startTime={currentShift.startTime} 
                      breakDuration={breakDuration}
                    />
                    
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                      Started {format(new Date(currentShift.startTime), 'h:mm a')}
                      {breakDuration > 0 && ` • Break time: ${Math.floor(breakDuration / 60)}h ${breakDuration % 60}m`}
                    </Typography>
                  </Box>
                  
                  {currentShift.status === 'on_break' && currentBreak ? (
                    <Box sx={{ mb: 3 }}>
                      <Chip 
                        icon={<Pause />} 
                        label={`On ${currentBreak.type} break since ${format(new Date(currentBreak.startTime), 'h:mm a')}`} 
                        color="warning"
                        sx={{ px: 1 }}
                      />
                    </Box>
                  ) : null}
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    {currentShift.status === 'active' ? (
                      <Button
                        variant="contained"
                        color="error"
                        startIcon={<Stop />}
                        onClick={onEndShift}
                        sx={{ px: 3, py: 1, borderRadius: 2 }}
                      >
                        End Shift
                      </Button>
                    ) : currentShift.status === 'on_break' ? (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PlayArrow />}
                        onClick={onEndBreak}
                        sx={{ px: 3, py: 1, borderRadius: 2 }}
                      >
                        End Break
                      </Button>
                    ) : null}
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                    You don't have an active shift
                  </Typography>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrow />}
                    onClick={onStartShift}
                    sx={{ px: 3, py: 1, borderRadius: 2 }}
                  >
                    Start Shift
                  </Button>
                </>
              )}
            </Box>
          </Paper>
          
          {/* Break control section */}
          {currentShift && currentShift.status === 'active' && (
            <Paper 
              elevation={2}
              sx={{ 
                p: 2.5, 
                borderRadius: 3, 
                mb: 3 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Take a Break
              </Typography>
              
              <Grid container spacing={1}>
                {breakTypes.map((breakType) => (
                  <Grid item key={breakType.type}>
                    <BreakButton
                      type={breakType.type}
                      label={breakType.label}
                      icon={breakType.icon}
                      onClick={(type) => onStartBreak(type)}
                      disabled={currentShift.status !== 'active'}
                      active={false}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}
          
          {/* Current location section */}
          {currentLocation && (
            <Paper 
              elevation={2}
              sx={{ 
                p: 2.5, 
                borderRadius: 3 
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <LocationOn sx={{ mr: 1, color: theme.palette.primary.main }} />
                Current Location
              </Typography>
              
              {currentLocation.error ? (
                <Typography variant="body2" color="error">
                  {currentLocation.error}
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Latitude
                    </Typography>
                    <Typography variant="body1">
                      {currentLocation.latitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Longitude
                    </Typography>
                    <Typography variant="body1">
                      {currentLocation.longitude.toFixed(6)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" color="textSecondary">
                      Last updated: {currentLocation.timestamp ? format(new Date(currentLocation.timestamp), 'h:mm:ss a') : 'Unknown'}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default CurrentShiftView;
