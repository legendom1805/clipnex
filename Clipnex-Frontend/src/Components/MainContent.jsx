import React from 'react';
import { useSelector } from 'react-redux';

function MainContent({ children }) {
  const { theme } = useSelector(state => state.auth);
  
  return (
    <div className={`font-Outfit min-h-screen transition-colors duration-200 ${
      theme === 'dark' 
        ? 'bg-darkbg text-white' 
        : 'bg-gray-50 text-gray-900'
    }`}>
      {children}
    </div>
  );
}

export default MainContent; 