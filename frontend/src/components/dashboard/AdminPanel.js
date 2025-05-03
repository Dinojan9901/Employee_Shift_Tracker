import React, { useContext, useEffect, useState } from 'react';
import { ShiftContext } from '../../context/ShiftContext';
import { 
  Container, 
  Paper, 
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import { 
  Search, 
  GetApp,
  FilterList 
} from '@mui/icons-material';
import { format } from 'date-fns';

const AdminPanel = () => {
  const { getAllShifts, shiftHistory, loading, error } = useContext(ShiftContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredShifts, setFilteredShifts] = useState([]);

  useEffect(() => {
    getAllShifts();
  }, []);

  useEffect(() => {
    if (shiftHistory) {
      setFilteredShifts(
        shiftHistory.filter(
          (shift) => 
            shift.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shift.employee.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  }, [shiftHistory, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(0);
  };

  // Function to format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return format(new Date(date), 'yyyy-MM-dd HH:mm:ss');
  };

  // Function to format duration in hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes && minutes !== 0) return 'N/A';
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Function to export CSV
  const exportToCSV = () => {
    const headers = [
      'Employee Name',
      'Email',
      'Shift Date',
      'Start Time',
      'End Time',
      'Work Duration',
      'Break Duration',
      'Status'
    ];

    const csvData = [
      headers.join(','),
      ...filteredShifts.map(shift => {
        return [
          `"${shift.employee.name}"`,
          `"${shift.employee.email}"`,
          format(new Date(shift.startTime), 'yyyy-MM-dd'),
          format(new Date(shift.startTime), 'HH:mm:ss'),
          shift.endTime ? format(new Date(shift.endTime), 'HH:mm:ss') : 'N/A',
          formatDuration(shift.totalWorkDuration),
          formatDuration(shift.totalBreakDuration),
          shift.status
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shifts_export_${format(new Date(), 'yyyyMMdd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !shiftHistory.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Admin Panel - Employee Shifts
        </Typography>
        <Typography variant="body2" color="textSecondary">
          View and export all employee shift records
        </Typography>
      </Paper>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <TextField
            placeholder="Search by employee name or email"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          
          <Box>
            <Button 
              variant="contained" 
              color="primary" 
              startIcon={<GetApp />}
              onClick={exportToCSV}
              disabled={filteredShifts.length === 0}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
        
        <TableContainer component={Paper} variant="outlined">
          <Table sx={{ minWidth: 650 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.light' }}>
                <TableCell>Employee</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Start Time</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Duration</TableCell>
                <TableCell>Break Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredShifts.length > 0 ? (
                filteredShifts
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((shift) => (
                    <TableRow key={shift._id} hover>
                      <TableCell>{shift.employee?.name || 'N/A'}</TableCell>
                      <TableCell>{shift.employee?.email || 'N/A'}</TableCell>
                      <TableCell>{format(new Date(shift.startTime), 'yyyy-MM-dd')}</TableCell>
                      <TableCell>{format(new Date(shift.startTime), 'HH:mm:ss')}</TableCell>
                      <TableCell>{shift.endTime ? format(new Date(shift.endTime), 'HH:mm:ss') : 'N/A'}</TableCell>
                      <TableCell>{formatDuration(shift.totalWorkDuration)}</TableCell>
                      <TableCell>{formatDuration(shift.totalBreakDuration)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={shift.status} 
                          color={
                            shift.status === 'active' ? 'success' : 
                            shift.status === 'on_break' ? 'warning' : 
                            'default'
                          }
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    {searchTerm ? 'No matching shifts found' : 'No shift data available'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredShifts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
};

export default AdminPanel;
