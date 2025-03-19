import axios from 'axios';
import conf from '../conf/conf';

const searchService = {
  searchVideos: async ({ 
    query = "", 
    page = 1, 
    limit = conf.defaultPageSize,
    sortBy = "createdAt",
    sortType = "desc",
    userId = null
  }) => {
    try {
      const params = {
        query,
        page,
        limit,
        sortBy,
        sortType,
        ...(userId && { userId })
      };

      const response = await axios.get(`${conf.apiBaseUrl}/videos/`, { params });
      return response.data.data; // Access the data array from the API response
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }
};

export default searchService; 