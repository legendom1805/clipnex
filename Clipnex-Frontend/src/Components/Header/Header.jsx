import React, { useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Logo2 from "../Logo2.jsx";
import { useNavigate } from "react-router-dom";
import { CircleUserIcon, SearchIcon, Upload } from "lucide-react";
import { checkAuthStatus } from "../../Store/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, theme } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const headerClass = theme === 'dark'
    ? 'bg-darkbg/90 border-white/50'
    : 'bg-white/90 border-gray-200';

  const textClass = theme === 'dark'
    ? 'text-white'
    : 'text-gray-900';

  const searchBarClass = theme === 'dark'
    ? 'bg-[#D9D9D9]/25 border-white/50'
    : 'bg-gray-100 border-gray-200';

  const searchTextClass = theme === 'dark'
    ? 'text-gray-300 placeholder-gray-400'
    : 'text-gray-700 placeholder-gray-500';

  const buttonClass = theme === 'dark'
    ? 'bg-fadetext/25 hover:bg-fadetext/30 text-white'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-900';

  return (
    <header className={`w-[100vw] p-3 border-b fixed backdrop-blur-sm transition-colors duration-200 ${headerClass}`}>
      <nav className="navbar flex w-[95vw] mx-auto">
        <div 
          className="logo flex items-center cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => navigate("/")}
        >
          <Logo2 />
          <h4 className={`ml-2 text-lg ${textClass}`}>Clipnex</h4>
        </div>
        <div className={`searchbar w-[40vw] flex items-center border rounded-lg mx-auto ${searchBarClass}`}>
          <div className={`flex items-center px-3 py-2`}>
            <SearchIcon className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} size={20} />
          </div>
          <input
            type="text"
            placeholder="Search"
            className={`w-full bg-transparent outline-none ${searchTextClass}`}
          />
        </div>
        <div className="flex items-center ml-4 mr-4">
          <button 
            className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-sm transition-colors ${buttonClass}`}
            onClick={() => navigate("/upload")}
          >
            <Upload size={16} />
            <span>Upload</span>
          </button>
        </div>
        <div className="user flex items-center">
          {!loading && (
            <>
              {!user ? (
                <div className="mr-4">
                  <button 
                    className={`border rounded-lg px-2 transition-colors ${buttonClass}`}
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <span className={textClass}>{user.username}</span>
                </div>
              )}
            </>
          )}
          <CircleUserIcon 
            className={`cursor-pointer ml-4 ${theme === 'dark' ? 'text-white' : 'text-gray-700'}`}
            size={32} 
            onClick={() => user && navigate('/settings')}
          />
        </div>
      </nav>
    </header>
  );
}

export default Header;
