import { useContext } from 'react';
import { AppContext } from '../context/AppContext';

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication state and methods
 * @property {boolean} isAuthenticated - Whether user is authenticated
 * @property {boolean} isLoading - Whether auth state is being initialized
 * @property {Function} login - Login function (userData, accessToken)
 * @property {Function} logout - Logout function
 */
const useAuth = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAuth must be used within an AppProvider');
  }

  return context;
};

export default useAuth;
