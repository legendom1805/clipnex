import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Input from './Input'
import Logo from './Logo'
import Button from './Button'
import { Link } from 'react-router-dom'
import { loginUser } from '../Store/authSlice'

// Create a custom event for auth state changes
export const authStateChange = new CustomEvent('authStateChanged', {
  detail: { type: 'login' }
});

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error, theme } = useSelector((state) => state.auth);
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  const handleLogin = async (data) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      if (result?.success) {
        navigate('/');
      }
    } catch (error) {
      console.error('Login failed:', error);
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
    <div className='flex items-center justify-center w-full'>
      <div className={`mx-auto w-full max-w-lg rounded-xl p-10 border ${containerClass}`}>
        <div className="mb-2 flex justify-center">
          <span className="inline-block w-full max-w-[100px]">
            <Logo width="100%" />
          </span>
        </div>
        <h2 className={`text-center text-2xl font-bold leading-tight ${textClass}`}>
          Sign in to your account
        </h2>
        <form onSubmit={handleSubmit(handleLogin)} className="mt-8">
          <div className='space-y-5'>
            <Input
              label="Email:"
              type="email"
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                  message: "Please enter a valid email address"
                }
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
            
            <Input
              label="Password: "
              type="password"
              placeholder="Enter your password"
              {...register("password", {
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
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>
        
        <p className={`mt-4 text-center text-base ${subTextClass}`}>
          Don&apos;t have any account?&nbsp;
          <Link
            to="/signup"
            className="font-medium text-purple-500 transition-all duration-200 hover:underline"
          >
            Sign Up
          </Link>
        </p>
        
        {error && (
          <p className={`text-red-600 mt-4 text-center ${theme === 'dark' ? 'bg-red-500/20' : 'bg-red-50'} p-2 rounded`}>
            {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default Login
