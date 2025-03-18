import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, UserIcon, MailIcon, SunIcon, MoonIcon } from 'lucide-react';
import { logoutUser, checkAuthStatus, toggleTheme } from '../Store/authSlice';

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, theme } = useSelector((state) => state.auth);
  // Get the actual user data from the nested structure
  const userData = user?.data;

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleLogout = async () => {
    try {
      const result = await dispatch(logoutUser()).unwrap();
      if (result.success) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>Please log in to view settings.</p>
      </div>
    );
  }

  const containerClass = theme === 'dark'
    ? 'bg-gray-900/50 border-gray-700'
    : 'bg-white/50 border-gray-200';

  const cardClass = theme === 'dark' 
    ? 'bg-gray-800' 
    : 'bg-white border border-gray-200';

  const headingClass = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const subTextClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-gray-600';

  const iconClass = theme === 'dark'
    ? 'text-gray-300'
    : 'text-gray-500';

  const sectionClass = theme === 'dark'
    ? 'bg-gray-700/50'
    : 'bg-gray-50 border border-gray-200';

  return (
    <div className="min-h-screen flex items-start justify-center pt-24 px-4 pb-8">
      <div className={`w-full max-w-3xl border rounded-xl p-8 shadow-lg ${containerClass}`}>
        <h1 className={`text-3xl font-bold mb-8 ${headingClass}`}>Settings</h1>
        
        <div className={`${cardClass} rounded-xl p-8 mb-6 shadow-lg transition-colors duration-200`}>
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>Account Settings</h2>
          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <div className={`flex items-center gap-4 p-4 rounded-lg ${sectionClass}`}>
                <UserIcon className={iconClass} size={24} />
                <div>
                  <p className={`font-medium text-lg ${headingClass}`}>Logged in as</p>
                  <p className={`text-lg ${subTextClass}`}>{userData.username}</p>
                </div>
              </div>
              <div className={`flex items-center gap-4 p-4 rounded-lg ${sectionClass}`}>
                <MailIcon className={iconClass} size={24} />
                <div>
                  <p className={`font-medium text-lg ${headingClass}`}>Email</p>
                  <p className={`text-lg ${subTextClass}`}>{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-xl p-8 mb-6 shadow-lg transition-colors duration-200`}>
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>Appearance</h2>
          <div className="space-y-4">
            <div className={`flex items-center justify-between p-4 rounded-lg ${sectionClass}`}>
              <div className="flex items-center gap-4">
                {theme === 'dark' ? (
                  <MoonIcon className={iconClass} size={24} />
                ) : (
                  <SunIcon className={iconClass} size={24} />
                )}
                <div>
                  <p className={`font-medium text-lg ${headingClass}`}>Theme</p>
                  <p className={subTextClass}>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                </div>
              </div>
              <button
                onClick={handleThemeToggle}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Toggle Theme
              </button>
            </div>
          </div>
        </div>

        <div className={`${cardClass} rounded-xl p-8 shadow-lg transition-colors duration-200`}>
          <h2 className={`text-2xl font-semibold mb-6 ${headingClass}`}>Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto justify-center text-lg font-medium"
            >
              <LogOutIcon size={24} />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
