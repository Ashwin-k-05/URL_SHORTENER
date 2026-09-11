import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  const tokenInStorage = localStorage.getItem('token');
  const userInStorage = localStorage.getItem('user');

  const isLoggedIn = isAuthenticated || (!!tokenInStorage && !!userInStorage);

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;