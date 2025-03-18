import React from "react";
import logo from "../assets/android-chrome-2192x192.png"
function Logo2({width = "32px"}) {
  return <img style={(width = { width })} src={logo} alt="Logo" />;
}

export default Logo2;
