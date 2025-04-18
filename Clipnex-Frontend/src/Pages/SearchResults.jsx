import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchVideos, clearSearch } from '../Store/searchSlice';
import VideoCard from '../Components/VideoCard';
import { Loader2 } from 'lucide-react';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.auth);
  const { searchResults, loading, error, currentQuery, totalResults } = useSelector((state) => state.search);

  const containerClass = theme === "dark" ? "bg-darkbg" : "bg-white";
  const textClass = theme === "dark" ? "text-white" : "text-gray-900";
  const subTextClass = theme === "dark" ? "text-gray-300" : "text-gray-600";

  useEffect(() => {
    const query = searchParams.get('q');
    if (query) {
      dispatch(searchVideos({ 
        query,
        page: 1,
        sortBy: "createdAt",
        sortType: "desc"
      }));
    } else {
      navigate('/');
    }
  }, [searchParams, dispatch, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearSearch());
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className={`min-h-screen ${containerClass} flex items-center justify-center`}>
        <Loader2 className={`w-8 h-8 animate-spin ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${containerClass} py-8 px-4 md:px-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-2xl font-bold mb-2 ${textClass}`}>
            Search Results for "{currentQuery}"
          </h1>
          <p className={subTextClass}>
            Found {totalResults} results
          </p>
        </div>

        {error && (
          <div className="text-red-500 mb-4">
            {error}
          </div>
        )}

        {searchResults.length === 0 && !loading && (
          <div className={`text-center py-12 ${subTextClass}`}>
            No videos found matching your search.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {searchResults.map((video) => (
            <VideoCard key={video._id} video={video} theme={theme} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchResults; 