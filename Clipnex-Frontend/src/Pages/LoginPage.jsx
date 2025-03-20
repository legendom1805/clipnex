import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginUser, checkAuthStatus, clearError } from '../Store/authSlice';
import Input from '../Components/Input';
import Button from '../Components/Button';
import Logo from '../Components/Logo';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { loading, error, theme } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Clear any existing errors when component mounts or unmounts
  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser({ email, password })).unwrap();
      if (result.success) {
        // Wait for auth status to be checked before navigating
        await dispatch(checkAuthStatus()).unwrap();
        // Navigate to the redirect path or home
        const redirectPath = location.state?.from || '/';
        navigate(redirectPath);
      }
    } catch (err) {
      // Error is handled by the reducer, no need to set it here
      console.error('Login failed:', err);
    }
  };

  const containerClass = theme === 'dark'
    ? 'bg-fadetext/25 border-gray-700'
    : 'bg-gray-100 border-black/10';

  const textClass = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const subTextClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-black/60';

  return (
    <div className="min-h-screen flex items-center justify-center pr-[15%]">
      <div className={`mx-auto w-full max-w-lg rounded-xl p-10 border ${containerClass}`}>
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className={`text-center text-2xl font-bold leading-tight ${textClass}`}>
          Sign in to your account
        </h2>
        <p className={`mt-2 text-center text-base ${subTextClass}`}>
          Don&apos;t have an account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-purple-500 transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
        {error && (
          <div className={`mt-6 p-4 rounded-lg border ${theme === 'dark' ? 'bg-red-500/20 border-red-500/30' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-red-500" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <div>
                <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-800'}`}>
                  Login Failed
                </h3>
                <p className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-700'}`}>
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
