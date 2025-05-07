import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Switch,
  Badge,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  AccessTime,
  History,
  Settings,
  Person,
  Logout,
  Brightness4,
  Brightness7,
  NotificationsOutlined,
  CalendarMonth,
  AdminPanelSettings,
  ChevronLeft,
  Search,
  DarkMode
} from '@mui/icons-material';

// Nav width
const drawerWidth = 240;

const ModernNavigation = ({ 
  title, 
  user, 
  darkMode, 
  onToggleDarkMode, 
  onLogout,
  notificationCount = 0
}) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  
  const userMenuOpen = Boolean(anchorEl);
  const notificationMenuOpen = Boolean(notificationAnchorEl);
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchorEl(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationAnchorEl(null);
  };
  
  const handleLogout = () => {
    handleUserMenuClose();
    if (onLogout) onLogout();
  };
  
  // Navigation items
  const navItems = [
    { 
      text: 'Dashboard', 
      icon: <Dashboard />, 
      path: '/dashboard',
      roles: ['employee', 'admin']
    },
    { 
      text: 'Current Shift', 
      icon: <AccessTime />, 
      path: '/current-shift',
      roles: ['employee', 'admin']
    },
    { 
      text: 'Shift History', 
      icon: <History />, 
      path: '/history',
      roles: ['employee', 'admin']
    },
    { 
      text: 'Calendar', 
      icon: <CalendarMonth />, 
      path: '/calendar',
      roles: ['employee', 'admin']
    },
    { 
      text: 'Admin Panel', 
      icon: <AdminPanelSettings />, 
      path: '/admin',
      roles: ['admin']
    },
    { 
      text: 'Settings', 
      icon: <Settings />, 
      path: '/settings',
      roles: ['employee', 'admin']
    }
  ];
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || !user?.role || (user.role && item.roles.includes(user.role))
  );
  
  // Drawer content
  const drawer = (
    <>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        p: 2,
        pt: 3
      }}>
        <Avatar 
          sx={{ 
            width: 64, 
            height: 64,
            mb: 1,
            bgcolor: theme.palette.primary.main
          }}
        >
          {user?.name ? user.name.charAt(0) : <Person />}
        </Avatar>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
          {user?.name || 'Guest User'}
        </Typography>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'No Role'}
        </Typography>
        
        {isMobile && (
          <IconButton 
            onClick={handleDrawerToggle}
            size="small"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Box>
      
      <Divider />
      
      <List sx={{ px: 1 }}>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={isMobile ? handleDrawerToggle : undefined}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.05)',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.15)' 
                      : 'rgba(0,0,0,0.08)',
                  }
                },
                '& .MuiListItemIcon-root': {
                  color: location.pathname === item.path 
                    ? theme.palette.primary.main
                    : 'inherit',
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} />
      
      <Divider />
      
      <Box sx={{ 
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="body2" color="textSecondary">
          Dark Mode
        </Typography>
        <Switch 
          checked={darkMode}
          onChange={onToggleDarkMode}
          icon={<Brightness7 fontSize="small" sx={{ color: 'white' }} />}
          checkedIcon={<DarkMode fontSize="small" sx={{ color: 'white' }} />}
          color="primary"
        />
      </Box>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      {/* AppBar */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: theme.palette.text.primary
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
            {title}
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Notification button */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              sx={{ mr: 1 }}
              onClick={handleNotificationMenuOpen}
            >
              <Badge badgeContent={notificationCount} color="error">
                <NotificationsOutlined />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User menu */}
          <Tooltip title="Account">
            <IconButton
              onClick={handleUserMenuOpen}
              size="small"
              sx={{ ml: 1 }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: theme.palette.primary.main 
                }}
              >
                {user?.name ? user.name.charAt(0) : <Person />}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      
      {/* User menu dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        onClick={handleUserMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem component={Link} to="/profile">
          <Person sx={{ mr: 1, fontSize: 18 }} /> Profile
        </MenuItem>
        <MenuItem component={Link} to="/settings">
          <Settings sx={{ mr: 1, fontSize: 18 }} /> Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout sx={{ mr: 1, fontSize: 18 }} /> Logout
        </MenuItem>
      </Menu>
      
      {/* Notification menu */}
      <Menu
        anchorEl={notificationAnchorEl}
        open={notificationMenuOpen}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
            mt: 1.5,
            width: 320,
            maxHeight: 400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notifications
          </Typography>
        </Box>
        <Divider />
        
        {notificationCount === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              No new notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 0 }}>
            <ListItem sx={{ px: 2, py: 1 }}>
              <ListItemText 
                primary="Your shift report has been sent" 
                secondary="2 minutes ago"
              />
            </ListItem>
            <Divider />
            <ListItem sx={{ px: 2, py: 1 }}>
              <ListItemText 
                primary="New shift schedule available" 
                secondary="1 hour ago"
              />
            </ListItem>
          </List>
        )}
        
        <Divider />
        <MenuItem sx={{ justifyContent: 'center' }}>
          <Typography variant="body2" color="primary">
            View all notifications
          </Typography>
        </MenuItem>
      </Menu>
      
      {/* Navigation drawer */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${theme.palette.divider}`
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
        }}
      >
        <Toolbar /> {/* To push content below the AppBar */}
      </Box>
    </Box>
  );
};

export default ModernNavigation;
