import React, { useContext, useEffect, useState } from 'react';
import { ShiftContext } from '../../context/ShiftContext';
import { AuthContext } from '../../context/AuthContext';
import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Grid, 
  Button, 
  CircularProgress,
  Chip,
  Divider,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  AccessTime,
  LocationOn,
  Restore
} from '@mui/icons-material';
import { format, formatDistance } from 'date-fns';
import ShiftControls from '../shifts/ShiftControls';
import ShiftStats from '../shifts/ShiftStats';
import LocationDisplay from '../maps/LocationDisplay';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { 
    currentShift, 
    loading, 
    error, 
    getCurrentShift, 
    getShiftHistory, 
    shiftHistory,
    startShift
  } = useContext(ShiftContext);
  
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  
  // Get current location
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLocationError('');
        },
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              setLocationError('User denied the request for Geolocation.');
              break;
            case error.POSITION_UNAVAILABLE:
              setLocationError('Location information is unavailable.');
              break;
            case error.TIMEOUT:
              setLocationError('The request to get user location timed out.');
              break;
            default:
              setLocationError('An unknown error occurred.');
              break;
          }
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  };
  
  // Load current shift on component mount
  useEffect(() => {
    getCurrentShift();
    getShiftHistory();
    getLocation();
    
    // Set up interval to refresh location
    const locationInterval = setInterval(() => {
      getLocation();
    }, 60000); // Update location every minute
    
    // Clean up
    return () => {
      clearInterval(locationInterval);
    };
  }, []);
  
  // Get shift status chip color
  const getStatusColor = (status) => {
    switch(status) {
      case 'active':
        return 'success';
      case 'on_break':
        return 'warning';
      case 'completed':
        return 'default';
      default:
        return 'primary';
    }
  };
  
  // Format date
  const formatDate = (date) => {
    return date ? format(new Date(date), 'PPpp') : 'N/A';
  };
  
  // Format duration
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  if (loading && !currentShift) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {locationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Welcome message */}
        <Grid item xs={12}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Welcome, {user?.name || 'Employee'}
            </Typography>
            <Typography variant="body1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Paper>
        </Grid>
        
        {/* Current shift status */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 240,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Current Shift Status
              </Typography>
              {currentShift && (
                <Chip 
                  label={currentShift.status === 'active' ? 'Working' : 'On Break'} 
                  color={getStatusColor(currentShift.status)}
                />
              )}
            </Box>
            
            {currentShift ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 1 }} />
                      <Typography variant="body1">
                        Started: {formatDate(currentShift.startTime)}
                      </Typography>
                    </Box>
                    
                    {currentShift.breaks && currentShift.breaks.length > 0 && 
                      currentShift.breaks[currentShift.breaks.length - 1].endTime === null && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Pause sx={{ mr: 1 }} />
                        <Typography variant="body1">
                          Break started: {formatDate(currentShift.breaks[currentShift.breaks.length - 1].startTime)}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <LocationDisplay 
                      locationData={
                        currentShift.status === 'on_break' && currentShift.breaks.length > 0
                          ? currentShift.breaks[currentShift.breaks.length - 1].location.coordinates
                          : currentShift.startLocation.coordinates
                      }
                    />
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <ShiftControls 
                  currentShift={currentShift} 
                  location={location}
                />
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  py: 4,
                }}
              >
                <Typography variant="h6" color="textSecondary" gutterBottom>
                  No active shift
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<PlayArrow />}
                  onClick={() => {
                    if (!location) {
                      setLocationError('Location is required to start a shift.');
                      return;
                    }
                    startShift(location);
                  }}
                  disabled={!location || loading}
                  sx={{ mt: 2 }}
                >
                  Start Shift
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        
        {/* Shift statistics */}
        <Grid item xs={12} md={4}>
          <ShiftStats history={shiftHistory} />
        </Grid>
        
        {/* Recent shifts */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Shifts
            </Typography>
            
            {shiftHistory.length > 0 ? (
              <Box sx={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Start Time</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>End Time</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Duration</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Breaks</th>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shiftHistory.slice(0, 5).map((shift) => (
                      <tr key={shift._id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '8px' }}>
                          {format(new Date(shift.startTime), 'PP')}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {format(new Date(shift.startTime), 'p')}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {shift.endTime ? format(new Date(shift.endTime), 'p') : 'N/A'}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {shift.totalWorkDuration > 0 
                            ? formatDuration(shift.totalWorkDuration) 
                            : 'N/A'}
                        </td>
                        <td style={{ padding: '8px' }}>
                          {shift.breaks.length}
                        </td>
                        <td style={{ padding: '8px' }}>
                          <Chip 
                            label={shift.status} 
                            color={getStatusColor(shift.status)}
                            size="small"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                No shift history available.
              </Typography>
            )}
            
            {shiftHistory.length > 5 && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button 
                  variant="text" 
                  color="primary"
                  endIcon={<Restore />}
                  onClick={() => {}}
                >
                  View All History
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
