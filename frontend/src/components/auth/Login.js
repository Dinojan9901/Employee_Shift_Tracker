import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Alert,
  CircularProgress
} from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showError, setShowError] = useState(false);
  
  const { login, isAuthenticated, error, loading, clearError } = useContext(AuthContext);
  const navigate = useNavigate();

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (error) {
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        clearError();
      }, 5000);
    }
  }, [isAuthenticated, error, navigate, clearError]);

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper 
        elevation={3} 
        sx={{
          mt: 8,
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Employee Shift Tracker
        </Typography>
        <Typography component="h2" variant="h6" sx={{ mt: 1 }}>
          Sign In
        </Typography>
        
        {showError && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={onSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={onChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={onChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ mt: 1 }}
          >
            Don't have an account? Sign Up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
