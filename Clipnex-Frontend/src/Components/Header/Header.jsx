import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import Logo2 from "../Logo2.jsx";
import { useNavigate } from "react-router-dom";
import { CircleUserIcon, SearchIcon, Upload, User } from "lucide-react";
import { checkAuthStatus } from "../../Store/authSlice";

function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, loading, theme } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState('');
  // Get the actual user data from the nested structure
  const userData = user?.data;

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

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
        <form onSubmit={handleSearch} className={`searchbar w-[40vw] flex items-center border rounded-lg mx-auto ${searchBarClass}`}>
          <div className={`flex items-center px-3 py-2`}>
            <SearchIcon className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} size={20} />
          </div>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-transparent outline-none ${searchTextClass}`}
          />
        </form>
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
                  <span className={textClass}>{userData?.username}</span>
                </div>
              )}
            </>
          )}
          <div 
            className="cursor-pointer ml-4 w-8 h-8 rounded-full overflow-hidden"
            onClick={() => user && navigate('/settings')}
          >
            {userData?.avatar ? (
              <img 
                src={userData.avatar} 
                alt={userData.username}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = ''; // Clear the src to show fallback
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <User className={theme === 'dark' ? 'text-white' : 'text-gray-700'} size={20} />
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
