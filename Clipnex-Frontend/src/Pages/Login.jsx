import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser, checkAuthStatus } from '../redux/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirectPath, setRedirectPath] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      console.log('Login result:', result);

      if (result.success) {
        // Dispatch checkAuthStatus to ensure we have the latest user data
        await dispatch(checkAuthStatus());
        navigate(redirectPath || '/');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default Login; 