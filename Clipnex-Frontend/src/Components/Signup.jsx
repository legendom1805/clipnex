import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import Input from './Input';
import Logo from './Logo';
import { Link } from 'react-router-dom';
import Button from './Button';
import * as authService from '../services/auth.service';
import { loginUser, clearError } from '../Store/authSlice';

function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, theme } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Clear any existing errors when component mounts or unmounts
  useEffect(() => {
    dispatch(clearError());
    return () => dispatch(clearError());
  }, [dispatch]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (data) => {
    try {
      // Create FormData object to handle file upload
      const formData = new FormData();
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('fullname', data.fullname);
      formData.append('password', data.password);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const session = await authService.registerUser(formData);
      if (session) {
        if (session.isLoggedIn) {
          const result = await dispatch(loginUser({
            email: data.email,
            password: data.password
          })).unwrap();
          
          if (result.success) {
            navigate('/');
          }
        } else {
          navigate('/login');
        }
      }
    } catch (err) {
      console.error('Registration failed:', err);
      let errorMessage = 'Registration failed. Please try again.';

      if (err.response?.status === 409) {
        // Check if it's a username or email conflict
        const message = err.response?.data?.message || '';
        if (message.toLowerCase().includes('email')) {
          errorMessage = 'An account with this email already exists';
        } else if (message.toLowerCase().includes('username')) {
          errorMessage = 'This username is already taken';
        } else {
          errorMessage = 'User already exists';
        }
      } else if (err.response?.data?.message) {
        // Clean up other error messages
        errorMessage = err.response.data.message
          .replace('Error: ', '')
          .replace('Request failed with status code ', '');
      }

      // Dispatch an action to set the error in Redux store
      dispatch({ type: 'auth/setError', payload: errorMessage });
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
          Sign up for an account
        </h2>

        <form onSubmit={handleSubmit(handleSignup)} className="mt-8">
          <div className="space-y-5">
            {/* Avatar Upload */}
            <div className="flex flex-col items-center space-y-3">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-500">
                <img 
                  src={avatarPreview || 'https://res.cloudinary.com/legendom/image/upload/v1736598411/bfehlrqg7l8pvjrnzvp0.png'} 
                  alt="Avatar preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center">
                <label 
                  htmlFor="avatar" 
                  className="cursor-pointer text-purple-500 hover:text-purple-600 transition-colors"
                >
                  Choose Avatar
                </label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
            </div>

            <Input
              label="Username"
              placeholder="Enter your username"
              {...register('username', { 
                required: "Username is required" 
              })}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              {...register('email', {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}

            <Input
              label="Full Name"
              placeholder="Enter your full name"
              {...register('fullname', { 
                required: "Full name is required" 
              })}
            />
            {errors.fullname && (
              <p className="text-red-500 text-sm mt-1">{errors.fullname.message}</p>
            )}

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              {...register('password', { 
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters"
                }
              })}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </div>
        </form>

        <p className={`mt-4 text-center text-base ${subTextClass}`}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-purple-500 transition-all duration-200 hover:underline"
          >
            Login
          </Link>
        </p>

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
                  Sign Up Failed
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

export default Signup;
