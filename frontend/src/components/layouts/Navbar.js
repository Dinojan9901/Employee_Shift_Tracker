import React, { useContext, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  useTheme,
} from '@mui/material';
import { AccountCircle, Brightness4, Brightness7 } from '@mui/icons-material';

const Navbar = ({ toggleDarkMode, darkMode }) => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    navigate('/profile');
    handleClose();
  };

  const guestLinks = (
    <>
      <Button color="inherit" component={RouterLink} to="/login">
        Login
      </Button>
      <Button color="inherit" component={RouterLink} to="/register">
        Register
      </Button>
    </>
  );

  const authLinks = (
    <>
      <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
        <Typography variant="body1" sx={{ mr: 2 }}>
          {user && user.name}
        </Typography>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Avatar sx={{ width: 32, height: 32 }}>
            <AccountCircle />
          </Avatar>
        </IconButton>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          {user && user.role === 'admin' && (
            <MenuItem component={RouterLink} to="/admin" onClick={handleClose}>
              Admin Panel
            </MenuItem>
          )}
          <MenuItem onClick={handleProfile}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to={isAuthenticated ? '/dashboard' : '/'}
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'white',
              fontWeight: 'bold',
            }}
          >
            Shift Tracker
          </Typography>
          
          <FormControlLabel
            control={
              <IconButton sx={{ ml: 1 }} onClick={toggleDarkMode} color="inherit">
                {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            }
            label=""
          />
          
          {isAuthenticated ? authLinks : guestLinks}
        </Toolbar>
      </AppBar>
    </Box>
  );
};

export default Navbar;
