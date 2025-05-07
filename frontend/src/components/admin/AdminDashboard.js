import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  IconButton, 
  Avatar, 
  Divider, 
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  useTheme
} from '@mui/material';
import {
  Group,
  AccessTime,
  TrendingUp,
  CalendarMonth,
  Search,
  FilterList,
  Person,
  ArrowDownward,
  ArrowUpward,
  GetApp,
  MoreVert,
  Dashboard
} from '@mui/icons-material';
import { format, differenceInMinutes } from 'date-fns';

// Helper functions
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

// Admin dashboard overview stats
const AdminOverviewStats = ({ stats }) => {
  const theme = useTheme();
  
  const statItems = [
    {
      title: 'Active Employees',
      value: stats.activeEmployeeCount || 0,
      icon: <Group />,
      color: theme.palette.primary.main
    },
    {
      title: 'Active Shifts',
      value: stats.activeShiftCount || 0,
      icon: <AccessTime />,
      color: theme.palette.success.main
    },
    {
      title: 'Total Hours Today',
      value: formatDuration(stats.totalHoursToday || 0),
      icon: <TrendingUp />,
      color: theme.palette.info.main
    },
    {
      title: 'Completed Shifts',
      value: stats.completedShiftCount || 0,
      icon: <CalendarMonth />,
      color: theme.palette.warning.main
    }
  ];
  
  return (
    <Grid container spacing={3}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper 
            elevation={2}
            sx={{
              p: 2,
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 6
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                  {item.title}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {item.value}
                </Typography>
              </Box>
              
              <Avatar 
                sx={{ 
                  bgcolor: `${item.color}20`,
                  width: 48,
                  height: 48,
                }}
              >
                <Box sx={{ color: item.color }}>
                  {item.icon}
                </Box>
              </Avatar>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

// Employee shift table component
const EmployeeShiftTable = ({ shifts, onExportData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'startTime', direction: 'desc' });
  
  // Handle search
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };
  
  // Handle sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Filter and sort shifts
  const filteredShifts = shifts.filter(shift => {
    if (!searchTerm) return true;
    
    const searchFields = [
      shift.employee?.name || '',
      shift.employee?.email || '',
      shift.status || ''
    ];
    
    const searchTermLower = searchTerm.toLowerCase();
    return searchFields.some(field => {
      if (!field) return false;
      return field.toLowerCase().includes(searchTermLower);
    });
  });
  
  const sortedShifts = [...filteredShifts].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    // Special handling for nested properties
    if (sortConfig.key === 'employee') {
      aValue = a.employee?.name || '';
      bValue = b.employee?.name || '';
    }
    
    // For dates
    if (sortConfig.key === 'startTime' || sortConfig.key === 'endTime') {
      aValue = aValue ? new Date(aValue).getTime() : 0;
      bValue = bValue ? new Date(bValue).getTime() : 0;
    }
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
  
  const paginatedShifts = sortedShifts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />;
  };
  
  // Get shift status chip
  const getStatusChip = (status) => {
    switch (status) {
      case 'active':
        return <Chip label="Active" size="small" color="success" />;
      case 'completed':
        return <Chip label="Completed" size="small" color="primary" />;
      case 'on_break':
        return <Chip label="On Break" size="small" color="warning" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };
  
  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight="bold">
          Employee Shifts
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ width: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          
          <Button 
            startIcon={<GetApp />} 
            variant="outlined" 
            size="small"
            onClick={onExportData}
          >
            Export CSV
          </Button>
        </Box>
      </Box>
      
      <Divider />
      
      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer'
                  }}
                  onClick={() => requestSort('employee')}
                >
                  Employee
                  {getSortIcon('employee')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer'
                  }}
                  onClick={() => requestSort('startTime')}
                >
                  Start Time
                  {getSortIcon('startTime')}
                </Box>
              </TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer'
                  }}
                  onClick={() => requestSort('endTime')}
                >
                  End Time
                  {getSortIcon('endTime')}
                </Box>
              </TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Break Count</TableCell>
              <TableCell>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    cursor: 'pointer'
                  }}
                  onClick={() => requestSort('status')}
                >
                  Status
                  {getSortIcon('status')}
                </Box>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedShifts.map((shift) => (
              <TableRow 
                key={shift._id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        width: 32, 
                        height: 32, 
                        mr: 1, 
                        bgcolor: 'primary.main' 
                      }}
                    >
                      <Person fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {shift.employee?.name || 'Unknown'}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {shift.employee?.email || ''}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  {shift.startTime ? (
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(shift.startTime), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(shift.startTime), 'h:mm a')}
                      </Typography>
                    </Box>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {shift.endTime ? (
                    <Box>
                      <Typography variant="body2">
                        {format(new Date(shift.endTime), 'MMM d, yyyy')}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {format(new Date(shift.endTime), 'h:mm a')}
                      </Typography>
                    </Box>
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  {formatDuration(getShiftDuration(shift))}
                </TableCell>
                <TableCell>
                  {shift.breaks?.length || 0}
                </TableCell>
                <TableCell>
                  {getStatusChip(shift.status)}
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            
            {paginatedShifts.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="textSecondary">
                    No shifts found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredShifts.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Main Admin Dashboard Component
const AdminDashboard = ({ shifts = [], employees = [] }) => {
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({
    activeEmployeeCount: 0,
    activeShiftCount: 0,
    totalHoursToday: 0,
    completedShiftCount: 0
  });
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle CSV export
  const handleExportCSV = () => {
    // CSV export implementation would go here
    console.log('Exporting data as CSV');
  };
  
  // Calculate dashboard stats
  useEffect(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const activeShifts = shifts.filter(shift => 
      shift.status === 'active' || shift.status === 'on_break'
    );
    
    const completedShifts = shifts.filter(shift => 
      shift.status === 'completed'
    );
    
    const completedToday = shifts.filter(shift => 
      shift.status === 'completed' && new Date(shift.endTime) >= today
    );
    
    // Total minutes worked today
    const totalMinutesToday = completedToday.reduce((total, shift) => {
      return total + getShiftDuration(shift);
    }, 0);
    
    // Count of unique employees with active shifts
    const activeEmployeeIds = new Set(
      activeShifts.map(shift => shift.employee?._id)
    );
    
    setStats({
      activeEmployeeCount: activeEmployeeIds.size,
      activeShiftCount: activeShifts.length,
      totalHoursToday: totalMinutesToday,
      completedShiftCount: completedShifts.length
    });
  }, [shifts, employees]);
  
  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Monitor and manage employee shifts and activities
        </Typography>
        
        <AdminOverviewStats stats={stats} />
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            label="All Shifts" 
            icon={<AccessTime fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Active Employees" 
            icon={<Group fontSize="small" />} 
            iconPosition="start"
          />
          <Tab 
            label="Analytics" 
            icon={<Dashboard fontSize="small" />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <EmployeeShiftTable 
          shifts={shifts} 
          onExportData={handleExportCSV}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Typography variant="body1">
          Employee management content will go here.
        </Typography>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        <Typography variant="body1">
          Analytics and reporting features will go here.
        </Typography>
      </TabPanel>
    </Box>
  );
};

export default AdminDashboard;
