import React from 'react'
import { useSelector } from 'react-redux'

function Button({
    children,
    type = "button",
    className = "",
    disabled = false,
    ...props
}) {
    const { theme } = useSelector(state => state.auth);
    
    const baseClass = theme === 'dark'
        ? 'bg-purple-500 text-white hover:bg-purple-600'
        : 'bg-purple-500 text-white hover:bg-purple-600';

    return (
        <button 
            type={type}
            disabled={disabled}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${baseClass} ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
