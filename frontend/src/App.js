import { useState, useEffect } from 'react';
import apiConfig from './utils/apiConfig';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, CircularProgress } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { ShiftProvider } from './context/ShiftContext';

// Layout Components
import Navbar from './components/layouts/Navbar';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Dashboard Components
import Dashboard from './components/dashboard/Dashboard';
import AdminPanel from './components/dashboard/AdminPanel';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const storedToken = localStorage.getItem('token');
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Set auth token in headers
        const token = storedToken;
        if (token) {
          fetch(`${apiConfig.baseUrl}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setIsAuthenticated(true);
                setIsAdmin(data.data.role === 'admin');
              }
              setIsLoading(false);
            })
            .catch(() => {
              setIsLoading(false);
            });
        }
      } catch (error) {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [storedToken]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function App() {
  // Fix dark mode toggle by using useEffect to sync with localStorage and checking initial state more carefully
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? savedMode === 'true' : false;
  });
  
  // Keep localStorage in sync with state changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#121212' : '#f5f5f5',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
    },
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    // No need to set localStorage here as the useEffect will handle it
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastContainer position="top-right" theme={darkMode ? 'dark' : 'light'} />
      <AuthProvider>
        <ShiftProvider>
          <Router>
            <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
            <Box component="main" sx={{ mt: 2, p: 2 }}>
              <Routes>
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/login" />} />
              </Routes>
            </Box>
          </Router>
        </ShiftProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
