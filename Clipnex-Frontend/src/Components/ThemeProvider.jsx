import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

function ThemeProvider({ children }) {
  const { theme } = useSelector((state) => state.auth);

  useEffect(() => {
    // Apply theme to document body
    document.body.className = theme === 'dark' ? 'bg-darkbg text-white' : 'bg-white text-gray-900';
    
    // Apply theme to root element for other styling hooks
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return <>{children}</>;
}

export default ThemeProvider; 