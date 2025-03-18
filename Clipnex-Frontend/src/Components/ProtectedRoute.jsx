import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  const location = useLocation();

  if (!user) {
    // Redirect to login but save the attempted path
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute; 