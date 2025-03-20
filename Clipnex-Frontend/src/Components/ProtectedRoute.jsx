import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useSelector(state => state.auth);
  const location = useLocation();

  console.log('ProtectedRoute state:', { 
    hasUser: !!user, 
    loading, 
    path: location.pathname 
  });

  // Don't show loading state here anymore since App.jsx handles initial load
  if (!user) {
    console.log('No user found in protected route, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  console.log('User authenticated, rendering protected content');
  return children;
};

export default ProtectedRoute; 