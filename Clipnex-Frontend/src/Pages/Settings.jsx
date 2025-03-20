import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { LogOutIcon, UserIcon, MailIcon, SunIcon, MoonIcon } from 'lucide-react';
import { logoutUser, checkAuthStatus, toggleTheme } from '../Store/authSlice';

function Settings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, theme } = useSelector((state) => state.auth);
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

  const containerClass = theme === "dark" ? "bg-darkbg" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-gray-900";
  const subTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";
  const cardClass = theme === "dark" ? "bg-fadetext/25" : "bg-white";
  const borderClass = theme === "dark" ? "border-wite-200" : "border-black-200";

  return (
    <div className={`min-h-screen ${containerClass} pr-[15%]`}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className={`text-2xl font-bold mb-8 ${textClass}`}>Settings</h1>

        {/* Account Information */}
        <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border mb-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Account Information</h2>
          <div className="space-y-4">
            <div className={`flex items-center gap-4 p-4 rounded-lg border ${borderClass}`}>
              <UserIcon className={subTextClass} size={20} />
              <div>
                <p className={`font-medium ${textClass}`}>Username</p>
                <p className={subTextClass}>{userData.username}</p>
              </div>
            </div>
            <div className={`flex items-center gap-4 p-4 rounded-lg border ${borderClass}`}>
              <MailIcon className={subTextClass} size={20} />
              <div>
                <p className={`font-medium ${textClass}`}>Email</p>
                <p className={subTextClass}>{userData.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border mb-6`}>
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Appearance</h2>
          <div className={`flex items-center justify-between p-4 rounded-lg border ${borderClass}`}>
            <div className="flex items-center gap-4">
              {theme === 'dark' ? (
                <MoonIcon className={subTextClass} size={20} />
              ) : (
                <SunIcon className={subTextClass} size={20} />
              )}
              <div>
                <p className={`font-medium ${textClass}`}>Theme</p>
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

        {/* Account Actions */}
        <div className={`${cardClass} rounded-lg p-6 shadow-lg ${borderClass} border`}>
          <h2 className={`text-xl font-semibold mb-4 ${textClass}`}>Account Actions</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors w-full sm:w-auto justify-center text-lg font-medium"
          >
            <LogOutIcon size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
