import React from 'react'

function Button({
    children,
    type = "button",
    bgcolor = "bg-white",
    className = "",
    textcolor = "text-black",
    ...props
}
) {
    return (
        <button className={`px-3 py-1 rounded-lg ${bgcolor} ${textcolor} ${className}`} {...props}>{children}</button>
    )
}

export default Button
