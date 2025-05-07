import React from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Avatar,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { 
  AccessTime, 
  CalendarToday,
  Person
} from '@mui/icons-material';
import { format } from 'date-fns';

const DashboardHeader = ({ user, currentShift }) => {
  const theme = useTheme();
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };
  
  // Format current date
  const formattedDate = format(new Date(), 'EEEE, MMMM d, yyyy');
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 2,
        background: theme.palette.mode === 'dark' 
          ? `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`
          : `linear-gradient(to right, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        mb: 3
      }}
    >
      {/* Background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          borderRadius: '50%',
          transform: 'translate(30%, -30%)',
        }}
      />
      
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60,
              bgcolor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.5)'
            }}
          >
            <Person fontSize="large" />
          </Avatar>
        </Grid>
        <Grid item xs>
          <Box>
            <Typography variant="h5" fontWeight="bold">
              {getGreeting()}, {user?.name || 'Employee'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CalendarToday fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                {formattedDate}
              </Typography>
            </Box>
          </Box>
        </Grid>
        <Grid item>
          {currentShift ? (
            <Chip 
              icon={<AccessTime />} 
              label={currentShift.status === 'active' ? 'On Duty' : 'On Break'} 
              variant="filled"
              sx={{ 
                bgcolor: currentShift.status === 'active' 
                  ? 'rgba(46, 204, 113, 0.8)' 
                  : 'rgba(243, 156, 18, 0.8)',
                color: 'white',
                fontWeight: 'bold',
                px: 1,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          ) : (
            <Chip 
              icon={<AccessTime />} 
              label="Not Working" 
              variant="filled"
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                px: 1,
                '& .MuiChip-icon': { color: 'white' }
              }}
            />
          )}
        </Grid>
      </Grid>
      
      {currentShift && (
        <>
          <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime fontSize="small" sx={{ mr: 1, opacity: 0.8 }} />
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Shift started at {format(new Date(currentShift.startTime), 'h:mm a')}
              {currentShift.status === 'on_break' && currentShift.breaks && currentShift.breaks.length > 0 && 
                ` • Break started at ${format(new Date(currentShift.breaks[currentShift.breaks.length - 1].startTime), 'h:mm a')}`}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
};

export default DashboardHeader;
