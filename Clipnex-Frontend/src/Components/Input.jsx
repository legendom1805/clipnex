import React, { forwardRef, useId } from 'react'
import { useSelector } from 'react-redux'

const Input = forwardRef(function input(
    {
        label,
        type = "text",
        className = "",
        ...props
    }, ref
) {
    const id = useId()
    const { theme } = useSelector((state) => state.auth)
    
    const inputClass = theme === 'dark'
        ? 'bg-[#D9D9D9]/25 border-white/50 text-white placeholder-gray-400'
        : 'bg-white text-black border-gray-200 focus:bg-gray-50'
    
    const labelClass = theme === 'dark'
        ? 'text-white'
        : 'text-gray-700'

    return (
        <div className='w-full'>
            {label && <label htmlFor={id} className={`inline-block mb-1 pl-1 ${labelClass}`}>{label}</label>}
            <input
                type={type}
                id={id}
                ref={ref}
                {...props}
                className={`px-3 py-2 rounded-lg outline-none duration-200 border w-full ${inputClass} ${className}`}
            />
        </div>
    )
})

export default Input
