import React from "react";
import logo from "../assets/Logo.png"
function Logo(width = "52px") {
  return <img style={(width = { width })} src={logo} alt="Logo" />;
}

export default Logo;
