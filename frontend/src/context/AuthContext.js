import { createContext, useReducer, useEffect } from 'react';
import axios from 'axios';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user,
        error: null,
      };
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload,
        error: null,
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on initial render
  useEffect(() => {
    const loadUser = async () => {
      // Check if token exists in localStorage
      const token = localStorage.getItem('token');
      if (token) {
        // Set the token in axios headers
        setAuthToken(token);
        try {
          // Make request to backend to validate token and get user data
          const res = await axios.get('http://localhost:5000/api/auth/me');
          // If successful, update the state with user data
          if (res.data.success) {
            dispatch({ type: 'USER_LOADED', payload: res.data.data });
          } else {
            // If response isn't successful despite having a token
            localStorage.removeItem('token');
            dispatch({ type: 'AUTH_ERROR', payload: 'Session expired. Please login again.' });
          }
        } catch (err) {
          console.error('Auth error:', err);
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR', payload: err.response?.data?.error || 'Authentication error' });
        }
      } else {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadUser();
  }, []);

  // Set auth token in headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // Register user
  const register = async (formData) => {
    try {
      // Clear any existing auth headers before registration
      delete axios.defaults.headers.common['Authorization'];
      
      // Make the registration request
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      
      if (res.data.success && res.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', res.data.token);
        // Set auth token in headers
        setAuthToken(res.data.token);
        
        // Get user data after successful registration
        const userRes = await axios.get('http://localhost:5000/api/auth/me');
        
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: { token: res.data.token, user: userRes.data.data },
        });
      } else {
        throw new Error('Registration successful but no token received');
      }
    } catch (err) {
      console.error('Registration error:', err);
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.error || 'Registration failed',
      });
    }
  };

  // Login user
  const login = async (formData) => {
    try {
      // Clear any existing auth headers before login
      delete axios.defaults.headers.common['Authorization'];
      
      // Make the login request
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      if (res.data.success && res.data.token) {
        // Store token in localStorage
        localStorage.setItem('token', res.data.token);
        // Set auth token in headers
        setAuthToken(res.data.token);
        
        // Get user data after successful login
        const userRes = await axios.get('http://localhost:5000/api/auth/me');
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token: res.data.token, user: userRes.data.data },
        });
      } else {
        throw new Error('Login successful but no token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.error || 'Invalid credentials',
      });
    }
  };

  // Logout
  const logout = () => dispatch({ type: 'LOGOUT' });

  // Clear errors
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        register,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
