import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Chip,
  Divider,
  Button,
  Stack,
  useTheme,
  Avatar
} from '@mui/material';
import { 
  AccessTime, 
  LocationOn, 
  DateRange,
  Restaurant,
  Coffee,
  Timer,
  Smoke,
  LocalDrink,
  Healing,
  Event,
  ArrowForward,
  Download,
  Email
} from '@mui/icons-material';
import { format, differenceInMinutes, differenceInHours } from 'date-fns';

// Helper for formatting duration
const formatDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 'In Progress';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const minutes = differenceInMinutes(end, start) % 60;
  const hours = differenceInHours(end, start);
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  } else {
    return `${hours} hr ${minutes} min`;
  }
};

// Get icon for break type
const getBreakIcon = (breakType) => {
  // Return default icon if breakType is null or undefined
  if (!breakType) return <Timer />;
  
  // Make sure breakType is a string before calling toLowerCase
  const breakTypeString = String(breakType).toLowerCase();
  
  switch (breakTypeString) {
    case 'lunch':
      return <Restaurant />;
    case 'coffee':
      return <Coffee />;
    case 'smoke':
      return <Smoke />;
    case 'personal':
      return <Healing />;
    case 'drink':
      return <LocalDrink />;
    default:
      return <Timer />;
  }
};

// Status chip component
const StatusChip = ({ status }) => {
  let color = 'default';
  let icon = <Event />;
  let label = status;
  
  switch (status) {
    case 'active':
      color = 'success';
      icon = <AccessTime />;
      label = 'Active';
      break;
    case 'completed':
      color = 'primary';
      icon = <Event />;
      label = 'Completed';
      break;
    case 'on_break':
      color = 'warning';
      icon = <Coffee />;
      label = 'On Break';
      break;
    default:
      color = 'default';
  }
  
  return (
    <Chip 
      icon={icon} 
      label={label} 
      color={color} 
      size="small"
      sx={{ fontWeight: 500 }} 
    />
  );
};

// Break list component
const BreaksList = ({ breaks }) => {
  if (!breaks || breaks.length === 0) {
    return (
      <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
        No breaks taken during this shift
      </Typography>
    );
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
        Breaks ({breaks.length})
      </Typography>
      
      <Stack spacing={1}>
        {breaks.map((breakItem, index) => (
          <Paper 
            key={index}
            variant="outlined"
            sx={{ 
              p: 1.5, 
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  mr: 1.5,
                  bgcolor: breakItem.type === 'lunch' ? 'warning.light' : 
                           breakItem.type === 'coffee' ? 'info.light' : 'secondary.light'
                }}
              >
                {getBreakIcon(breakItem.type)}
              </Avatar>
              
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {breakItem.type.charAt(0).toUpperCase() + breakItem.type.slice(1)} Break
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {format(new Date(breakItem.startTime), 'h:mm a')}
                  {breakItem.endTime && (
                    <>
                      <ArrowForward sx={{ fontSize: 10, mx: 0.5, verticalAlign: 'middle' }} />
                      {format(new Date(breakItem.endTime), 'h:mm a')}
                    </>
                  )}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label={breakItem.endTime ? formatDuration(breakItem.startTime, breakItem.endTime) : 'In progress'} 
              size="small"
              color={breakItem.endTime ? 'default' : 'warning'}
              variant={breakItem.endTime ? 'outlined' : 'filled'}
            />
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

const ShiftDetailsCard = ({ shift, onExport, onSendEmail }) => {
  const theme = useTheme();
  
  if (!shift) {
    return (
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="textSecondary">
          No shift data available
        </Typography>
      </Paper>
    );
  }
  
  // Calculate total break time in minutes
  const calculateBreakTime = () => {
    if (!shift.breaks || shift.breaks.length === 0) return 0;
    
    return shift.breaks.reduce((total, breakItem) => {
      if (!breakItem.startTime) return total;
      const start = new Date(breakItem.startTime);
      const end = breakItem.endTime ? new Date(breakItem.endTime) : new Date();
      return total + differenceInMinutes(end, start);
    }, 0);
  };
  
  const breakTimeMinutes = calculateBreakTime();
  
  // Calculate total work time
  const calculateWorkTime = () => {
    if (!shift.startTime) return 0;
    
    const start = new Date(shift.startTime);
    const end = shift.endTime ? new Date(shift.endTime) : new Date();
    const totalMinutes = differenceInMinutes(end, start);
    
    return totalMinutes - breakTimeMinutes;
  };
  
  const workTimeMinutes = calculateWorkTime();
  
  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          p: 2.5,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(90deg, rgba(66,66,66,1) 0%, rgba(33,33,33,1) 100%)' 
            : 'linear-gradient(90deg, rgba(240,249,255,1) 0%, rgba(224,242,254,1) 100%)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Shift Details
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {format(new Date(shift.startTime), 'EEEE, MMMM d, yyyy')}
          </Typography>
        </Box>
        
        <StatusChip status={shift.status} />
      </Box>
      
      {/* Content */}
      <Box sx={{ p: 2.5 }}>
        <Grid container spacing={3}>
          {/* Time section */}
          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                TIME DETAILS
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <AccessTime sx={{ mr: 1.5, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Start Time
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(shift.startTime), 'h:mm a')}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <AccessTime sx={{ mr: 1.5, color: shift.endTime ? 'success.main' : 'text.disabled' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        End Time
                      </Typography>
                      <Typography variant="body2">
                        {shift.endTime 
                          ? format(new Date(shift.endTime), 'h:mm a')
                          : '—'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Timer sx={{ mr: 1.5, color: 'info.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Duration
                      </Typography>
                      <Typography variant="body2">
                        {shift.endTime 
                          ? formatDuration(shift.startTime, shift.endTime)
                          : 'In progress'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Coffee sx={{ mr: 1.5, color: 'warning.main' }} />
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        Break Time
                      </Typography>
                      <Typography variant="body2">
                        {breakTimeMinutes > 0 
                          ? `${Math.floor(breakTimeMinutes / 60)}h ${breakTimeMinutes % 60}m`
                          : 'No breaks'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
            
            <Divider sx={{ my: 2.5 }} />
            
            {/* Location section */}
            <Box>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
                LOCATION DETAILS
              </Typography>
              
              <Box sx={{ display: 'flex', mb: 2 }}>
                <LocationOn sx={{ mr: 1.5, color: 'success.main' }} />
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    Start Location
                  </Typography>
                  <Typography variant="body2">
                    {shift.startLocation?.coordinates?.length === 2 
                      ? `${shift.startLocation.coordinates[1].toFixed(6)}, ${shift.startLocation.coordinates[0].toFixed(6)}`
                      : 'No location data'}
                  </Typography>
                </Box>
              </Box>
              
              {shift.endLocation?.coordinates?.length === 2 && (
                <Box sx={{ display: 'flex', mb: 2 }}>
                  <LocationOn sx={{ mr: 1.5, color: 'error.main' }} />
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      End Location
                    </Typography>
                    <Typography variant="body2">
                      {`${shift.endLocation.coordinates[1].toFixed(6)}, ${shift.endLocation.coordinates[0].toFixed(6)}`}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Grid>
          
          {/* Breaks section */}
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 2 }}>
              BREAKS DETAILS
            </Typography>
            
            <BreaksList breaks={shift.breaks} />
          </Grid>
        </Grid>
        
        {/* Actions */}
        {(onExport || onSendEmail) && (
          <>
            <Divider sx={{ my: 2.5 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {onExport && (
                <Button 
                  startIcon={<Download />} 
                  variant="outlined" 
                  size="small"
                  onClick={() => onExport(shift)}
                >
                  Export
                </Button>
              )}
              
              {onSendEmail && (
                <Button 
                  startIcon={<Email />} 
                  variant="contained" 
                  size="small"
                  onClick={() => onSendEmail(shift)}
                >
                  Send Report
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default ShiftDetailsCard;
