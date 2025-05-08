// Determine the base API URL based on environment
const getApiBaseUrl = () => {
  // For production, use the environment variable
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_API_URL || 'https://employee-shift-tracker-api.onrender.com/api';
  }
  
  // For development, also use the deployed API to maintain consistency
  return 'https://employee-shift-tracker.onrender.com/api';
};

const apiConfig = {
  baseUrl: getApiBaseUrl()
};

export default apiConfig;
