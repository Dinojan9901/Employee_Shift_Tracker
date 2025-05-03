import React, { useState, useContext } from 'react';
import { ShiftContext } from '../../context/ShiftContext';
import {
  Box,
  Button,
  ButtonGroup,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Stop,
  RestartAlt
} from '@mui/icons-material';

const ShiftControls = ({ currentShift, location }) => {
  const { startShift, endShift, startBreak, endBreak, loading } = useContext(ShiftContext);
  const [breakDialogOpen, setBreakDialogOpen] = useState(false);
  const [breakType, setBreakType] = useState('short');
  const [error, setError] = useState('');

  // Handle starting a shift
  const handleStartShift = () => {
    if (!location) {
      setError('Location is required to start a shift.');
      return;
    }
    startShift(location);
  };

  // Handle ending a shift
  const handleEndShift = () => {
    if (!location) {
      setError('Location is required to end a shift.');
      return;
    }
    endShift(location);
  };

  // Handle opening break dialog
  const handleBreakDialogOpen = () => {
    setBreakDialogOpen(true);
  };

  // Handle closing break dialog
  const handleBreakDialogClose = () => {
    setBreakDialogOpen(false);
  };

  // Handle break type change
  const handleBreakTypeChange = (event) => {
    setBreakType(event.target.value);
  };

  // Handle starting a break
  const handleStartBreak = () => {
    if (!location) {
      setError('Location is required to start a break.');
      setBreakDialogOpen(false);
      return;
    }
    
    startBreak({
      breakType,
      ...location
    });
    setBreakDialogOpen(false);
  };

  // Handle ending a break
  const handleEndBreak = () => {
    if (!location) {
      setError('Location is required to end a break.');
      return;
    }
    endBreak(location);
  };

  // Clear error after 5 seconds
  if (error) {
    setTimeout(() => {
      setError('');
    }, 5000);
  }

  // Determine if user is on break
  const isOnBreak = currentShift && currentShift.status === 'on_break';

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        {!currentShift ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrow />}
            onClick={handleStartShift}
            disabled={!location || loading}
            size="large"
          >
            Start Shift
          </Button>
        ) : (
          <ButtonGroup variant="contained" aria-label="shift control buttons">
            {isOnBreak ? (
              <Button
                color="success"
                startIcon={<RestartAlt />}
                onClick={handleEndBreak}
                disabled={!location || loading}
              >
                Resume Shift
              </Button>
            ) : (
              <Button
                color="warning"
                startIcon={<Pause />}
                onClick={handleBreakDialogOpen}
                disabled={loading}
              >
                Take Break
              </Button>
            )}
            <Button
              color="error"
              startIcon={<Stop />}
              onClick={handleEndShift}
              disabled={!location || loading}
            >
              End Shift
            </Button>
          </ButtonGroup>
        )}
      </Box>

      {/* Break Type Dialog */}
      <Dialog open={breakDialogOpen} onClose={handleBreakDialogClose}>
        <DialogTitle>Select Break Type</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="break-type-label">Break Type</InputLabel>
            <Select
              labelId="break-type-label"
              id="break-type"
              value={breakType}
              label="Break Type"
              onChange={handleBreakTypeChange}
            >
              <MenuItem value="short">Short Break</MenuItem>
              <MenuItem value="lunch">Lunch Break</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBreakDialogClose}>Cancel</Button>
          <Button onClick={handleStartBreak} variant="contained">Start Break</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ShiftControls;
