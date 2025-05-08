// Determine the base API URL based on environment
const getApiBaseUrl = () => {
  // For production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://employee-shift-tracker.onrender.com/api';
  }
  
  // For development, check if we want to use local or remote API
  // Use local API by default for development
  const useLocalApi = process.env.REACT_APP_USE_LOCAL_API !== 'false';
  
  return useLocalApi 
    ? 'http://localhost:5000/api'
    : 'https://employee-shift-tracker.onrender.com/api';
};

const apiConfig = {
  baseUrl: getApiBaseUrl()
};

export default apiConfig;
