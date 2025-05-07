import { createContext, useReducer } from 'react';
import axios from 'axios';
import apiConfig from '../utils/apiConfig';

// Initial state
const initialState = {
  currentShift: null,
  shiftHistory: [],
  loading: false,
  error: null,
};

// Reducer function
const shiftReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: true,
      };
    case 'SHIFT_STARTED':
      return {
        ...state,
        currentShift: action.payload,
        loading: false,
        error: null,
      };
    case 'SHIFT_ENDED':
      return {
        ...state,
        currentShift: null,
        shiftHistory: [action.payload, ...state.shiftHistory],
        loading: false,
        error: null,
      };
    case 'BREAK_STARTED':
    case 'BREAK_ENDED':
    case 'GET_CURRENT_SHIFT':
      return {
        ...state,
        currentShift: action.payload,
        loading: false,
        error: null,
      };
    case 'GET_SHIFT_HISTORY':
      return {
        ...state,
        shiftHistory: action.payload,
        loading: false,
        error: null,
      };
    case 'SHIFT_ERROR':
      return {
        ...state,
        loading: false,
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
export const ShiftContext = createContext();

// Provider component
export const ShiftProvider = ({ children }) => {
  const [state, dispatch] = useReducer(shiftReducer, initialState);

  // Start a new shift
  const startShift = async (locationData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post(`${apiConfig.baseUrl}/shifts/start`, locationData);
      dispatch({ type: 'SHIFT_STARTED', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to start shift' 
      });
    }
  };

  // End current shift
  const endShift = async (locationData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`${apiConfig.baseUrl}/shifts/end`, locationData);
      dispatch({ type: 'SHIFT_ENDED', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to end shift' 
      });
    }
  };

  // Start a break
  const startBreak = async (breakData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`${apiConfig.baseUrl}/shifts/break/start`, breakData);
      dispatch({ type: 'BREAK_STARTED', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to start break' 
      });
    }
  };

  // End a break
  const endBreak = async (locationData) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`${apiConfig.baseUrl}/shifts/break/end`, locationData);
      dispatch({ type: 'BREAK_ENDED', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to end break' 
      });
    }
  };

  // Get current shift
  const getCurrentShift = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`${apiConfig.baseUrl}/shifts/current`);
      dispatch({ type: 'GET_CURRENT_SHIFT', payload: res.data.data });
    } catch (err) {
      // If no active shift, set currentShift to null but don't show error
      if (err.response?.status === 404) {
        dispatch({ type: 'GET_CURRENT_SHIFT', payload: null });
      } else {
        dispatch({ 
          type: 'SHIFT_ERROR', 
          payload: err.response?.data?.error || 'Failed to fetch current shift' 
        });
      }
    }
  };

  // Get shift history
  const getShiftHistory = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`${apiConfig.baseUrl}/shifts`);
      dispatch({ type: 'GET_SHIFT_HISTORY', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to fetch shift history' 
      });
    }
  };

  // Get all shifts (admin only)
  const getAllShifts = async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`${apiConfig.baseUrl}/shifts/all`);
      dispatch({ type: 'GET_SHIFT_HISTORY', payload: res.data.data });
    } catch (err) {
      dispatch({ 
        type: 'SHIFT_ERROR', 
        payload: err.response?.data?.error || 'Failed to fetch all shifts' 
      });
    }
  };

  // Clear errors
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  return (
    <ShiftContext.Provider
      value={{
        currentShift: state.currentShift,
        shiftHistory: state.shiftHistory,
        loading: state.loading,
        error: state.error,
        startShift,
        endShift,
        startBreak,
        endBreak,
        getCurrentShift,
        getShiftHistory,
        getAllShifts,
        clearError,
      }}
    >
      {children}
    </ShiftContext.Provider>
  );
};
