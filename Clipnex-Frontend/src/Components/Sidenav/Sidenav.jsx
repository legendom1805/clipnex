import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from 'react-redux';
import {
  Headset,
  History,
  HomeIcon,
  ListVideo,
  PlaySquare,
  SettingsIcon,
  ThumbsUpIcon,
  User,
} from "lucide-react";

function Sidenav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useSelector(state => state.auth);

  const textClass = theme === 'dark' 
    ? 'text-white' 
    : 'text-gray-900';

  const borderClass = theme === 'dark'
    ? 'border-white/50'
    : 'border-gray-200';

  const hrClass = theme === 'dark'
    ? 'border-white/15'
    : 'border-gray-200';

  const isActive = (path) => location.pathname === path;

  const getButtonClass = (path, isTopSection = true) => {
    const baseClass = `${textClass} flex rounded-lg ${isTopSection ? 'border' : 'border-transparent'} px-5 ${isTopSection ? 'py-2' : 'pb-2'} items-center`;
    const activeClass = isTopSection ? `
      border-transparent relative
      shadow-[5px_0_15px_-3px_#F200FF,0_0_15px_0_#00F6FF]
      transition-all duration-300
    ` : '';
    
    return `${baseClass} ${isActive(path) ? activeClass : ''}`;
  };

  return (
    <div className={`fixed right-0 border-l ${borderClass} w-[15%] h-full`}>
      <nav className="flex flex-col w-[80%] mx-auto my-7">
        <div className="flex flex-col w-[100%] mx-auto space-y-[14px]">
          <button className={getButtonClass("/")} onClick={() => navigate("/")}>
            <HomeIcon />
            <span className="ml-2">Home</span>
          </button>
          <button className={getButtonClass("/playlists")} onClick={() => navigate("/playlists")}>
            <ListVideo />
            <span className="ml-2">Playlists</span>
          </button>
          <button className={getButtonClass("/yourvideos")} onClick={() => navigate("/yourvideos")}>
            <PlaySquare />
            <span className="ml-2">Your Videos</span>
          </button>
        </div>
        <hr className={`${hrClass} my-8`} />
        <div className="flex flex-col w-[100%] mx-auto space-y-[14px]">
          <button className={getButtonClass("/history", false)} onClick={() => navigate("/history")}>
            <History />
            <span className="ml-2">History</span>
          </button>
          <button className={getButtonClass("/liked", false)} onClick={() => navigate("/liked")}>
            <ThumbsUpIcon />
            <span className="ml-2">Liked</span>
          </button>
          <button className={getButtonClass("/youraccount", false)} onClick={() => navigate("/youraccount")}>
            <User />
            <span className="ml-2">Your Account</span>
          </button>
        </div>
        <hr className={`${hrClass} my-8`} />
        <div className="flex flex-col w-[100%] mx-auto space-y-[14px]">
          <button className={getButtonClass("/support", false)} onClick={() => navigate("/support")}>
            <Headset />
            <span className="ml-2">Support</span>
          </button>
          <button className={getButtonClass("/settings", false)} onClick={() => navigate("/settings")}>
            <SettingsIcon />
            <span className="ml-2">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Sidenav;
